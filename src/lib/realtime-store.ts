// Tiny pub/sub stores for realtime mock data: notifications, audit log, orders.
// Adds deterministic event IDs, persistent toast dedup, and mute settings
// so reloads don't re-fire old toasts.
import { useSyncExternalStore } from "react";
import {
  notifications as seedNotifications,
  orders as seedOrders,
  products as seedProducts,
  type Order,
  type OrderStatus,
} from "./mock-data";

// ---------- generic store ----------
function createStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => state,
    set: (next: T | ((prev: T) => T)) => {
      state = typeof next === "function" ? (next as (p: T) => T)(state) : next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

// ---------- persistent helpers ----------
const TOAST_SEEN_KEY = "northwind.toast.seen.v1";
const MUTED_KEY = "northwind.notifications.muted.v1";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

// FNV-1a 32-bit hash → short hex id (deterministic, no Date.now).
export function hashId(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

// Mark a toast-eligible event as shown; returns false if it was already
// surfaced in this browser (across refreshes).
export function shouldShowToast(eventId: string): boolean {
  if (typeof window === "undefined") return false;
  const seen = safeRead<string[]>(TOAST_SEEN_KEY, []);
  if (seen.includes(eventId)) return false;
  const next = [...seen, eventId].slice(-300);
  safeWrite(TOAST_SEEN_KEY, next);
  return true;
}

// ---------- notifications ----------
export type NotificationType = "order" | "stock" | "payment" | "message" | "refund" | "system";

export type NotificationItem = {
  id: string; // deterministic content hash
  type: NotificationType;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
};

const notificationsStore = createStore<NotificationItem[]>(
  seedNotifications.map((n) => ({
    ...n,
    type: n.type as NotificationType,
    id: hashId(`seed:${n.type}:${n.title}:${n.desc}`),
  })),
);

const mutedStore = createStore<Record<NotificationType, boolean>>(
  safeRead<Record<NotificationType, boolean>>(MUTED_KEY, {
    order: false, stock: false, payment: false, message: false, refund: false, system: false,
  }),
);

export function useNotifications() {
  return useSyncExternalStore(notificationsStore.subscribe, notificationsStore.get, notificationsStore.get);
}
export function useMutedTypes() {
  return useSyncExternalStore(mutedStore.subscribe, mutedStore.get, mutedStore.get);
}

export const notificationsApi = {
  push: (n: Omit<NotificationItem, "id" | "time" | "unread"> & { id?: string }) => {
    const muted = mutedStore.get();
    if (muted[n.type]) return null;
    const id = n.id ?? hashId(`${n.type}:${n.title}:${n.desc}`);
    const existing = notificationsStore.get();
    if (existing.some((x) => x.id === id)) return id; // dedup
    notificationsStore.set((prev) => [
      { id, type: n.type, title: n.title, desc: n.desc, time: "just now", unread: true },
      ...prev,
    ].slice(0, 50));
    return id;
  },
  markRead: (id: string) =>
    notificationsStore.set((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n))),
  markUnread: (id: string) =>
    notificationsStore.set((prev) => prev.map((n) => (n.id === id ? { ...n, unread: true } : n))),
  remove: (id: string) =>
    notificationsStore.set((prev) => prev.filter((n) => n.id !== id)),
  markAllRead: () => notificationsStore.set((prev) => prev.map((n) => ({ ...n, unread: false }))),
  get: notificationsStore.get,
};

export const mutedApi = {
  setMuted: (type: NotificationType, muted: boolean) => {
    mutedStore.set((prev) => {
      const next = { ...prev, [type]: muted };
      safeWrite(MUTED_KEY, next);
      return next;
    });
  },
  toggle: (type: NotificationType) => mutedApi.setMuted(type, !mutedStore.get()[type]),
  get: mutedStore.get,
};

// ---------- audit log ----------
export type AuditAction =
  | "create" | "edit" | "delete" | "refund" | "status_change" | "login" | "export";
export type AuditEntityType = "Order" | "Product" | "Customer" | "Coupon" | "Review" | "User" | "Export" | "System";
export type AuditSeverity = "info" | "warning" | "critical";

export type AuditEntry = {
  id: string;
  actor: string;
  action: AuditAction;
  entity: string;
  entityType: AuditEntityType;
  severity: AuditSeverity;
  detail: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  timestamp: string;
};

const seedAudit: AuditEntry[] = [
  { id: "a1", actor: "Elena Brooks", action: "status_change", entity: "Order #ORD-4842", entityType: "Order", severity: "info", detail: "processing → shipped", before: { fulfillment: "processing" }, after: { fulfillment: "shipped" }, timestamp: "2026-06-25T09:21:00Z" },
  { id: "a2", actor: "Marcus Wei", action: "edit", entity: "Product Aurora Wireless Headphones", entityType: "Product", severity: "info", detail: "Price $189 → $179", before: { price: 189 }, after: { price: 179 }, timestamp: "2026-06-25T08:58:00Z" },
  { id: "a3", actor: "Priya Shah", action: "create", entity: "Coupon SUMMER40", entityType: "Coupon", severity: "info", detail: "40% off, expires 2026-08-15", after: { code: "SUMMER40", discount: "40%", expires: "2026-08-15" }, timestamp: "2026-06-24T17:42:00Z" },
  { id: "a4", actor: "Daniel Kim", action: "refund", entity: "Order #ORD-4812", entityType: "Order", severity: "warning", detail: "Refunded $58.00 to customer", before: { payment: "paid", amount: 58 }, after: { payment: "refunded", amount: 0 }, timestamp: "2026-06-24T15:10:00Z" },
  { id: "a5", actor: "Elena Brooks", action: "delete", entity: "Review rv7", entityType: "Review", severity: "critical", detail: "Removed flagged review", before: { status: "flagged", text: "Spam content" }, timestamp: "2026-06-24T13:02:00Z" },
  { id: "a6", actor: "Marcus Wei", action: "edit", entity: "Customer Sofia Reyes", entityType: "Customer", severity: "info", detail: "Updated shipping address", before: { address: "12 Pine Rd" }, after: { address: "44 Oak Ave" }, timestamp: "2026-06-24T11:30:00Z" },
  { id: "a7", actor: "Aisha Bello", action: "login", entity: "Admin session", entityType: "User", severity: "info", detail: "Signed in from Chrome / macOS", timestamp: "2026-06-24T09:15:00Z" },
  { id: "a8", actor: "Priya Shah", action: "create", entity: "Product Solstice Hoodie", entityType: "Product", severity: "info", detail: "Added to Fashion catalog", after: { name: "Solstice Hoodie", category: "Fashion", price: 64 }, timestamp: "2026-06-23T16:48:00Z" },
];

const auditStore = createStore<AuditEntry[]>(seedAudit);

export function useAuditLog() {
  return useSyncExternalStore(auditStore.subscribe, auditStore.get, auditStore.get);
}

const SEVERITY_BY_ACTION: Record<AuditAction, AuditSeverity> = {
  create: "info", edit: "info", status_change: "info", login: "info",
  export: "info", refund: "warning", delete: "critical",
};

export const auditApi = {
  log: (entry: Omit<AuditEntry, "id" | "timestamp" | "severity" | "entityType"> & {
    severity?: AuditSeverity;
    entityType?: AuditEntityType;
  }) => {
    const id = hashId(`${entry.actor}:${entry.action}:${entry.entity}:${entry.detail}:${auditStore.get().length}`);
    auditStore.set((prev) => [
      {
        ...entry,
        id,
        entityType: entry.entityType ?? inferEntityType(entry.entity),
        severity: entry.severity ?? SEVERITY_BY_ACTION[entry.action],
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 200));
  },
  get: auditStore.get,
};

function inferEntityType(entity: string): AuditEntityType {
  const e = entity.toLowerCase();
  if (e.includes("order")) return "Order";
  if (e.includes("product")) return "Product";
  if (e.includes("customer")) return "Customer";
  if (e.includes("coupon")) return "Coupon";
  if (e.includes("review")) return "Review";
  if (e.includes("user") || e.includes("session")) return "User";
  if (e.includes("export") || /\b(orders|products|customers|inventory|audit)\b/.test(e)) return "Export";
  return "System";
}

// ---------- orders ----------
const ordersStore = createStore<Order[]>(seedOrders);
export function useOrders() {
  return useSyncExternalStore(ordersStore.subscribe, ordersStore.get, ordersStore.get);
}
export const ordersApi = {
  setStatus: (id: string, fulfillment: OrderStatus) =>
    ordersStore.set((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment } : o))),
  get: ordersStore.get,
};

// ---------- realtime simulator ----------
let started = false;
const STATUS_PROGRESS: Record<OrderStatus, OrderStatus | null> = {
  pending: "processing",
  processing: "shipped",
  shipped: "delivered",
  delivered: null,
  cancelled: null,
  returned: "refunded",
  refunded: null,
};

export function startRealtimeSimulator() {
  if (started || typeof window === "undefined") return;
  started = true;

  setInterval(() => {
    const list = ordersStore.get();
    const candidates = list.filter((o) => STATUS_PROGRESS[o.fulfillment]);
    if (!candidates.length) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const next = STATUS_PROGRESS[target.fulfillment]!;
    const before = target.fulfillment;
    ordersApi.setStatus(target.id, next);
    notificationsApi.push({
      type: "order",
      title: `Order ${target.id} ${next}`,
      desc: `${target.customer} — status changed to ${next}`,
    });
    auditApi.log({
      actor: "System",
      action: "status_change",
      entity: `Order ${target.id}`,
      detail: `${before} → ${next}`,
      before: { fulfillment: before },
      after: { fulfillment: next },
    });
  }, 22000);

  setInterval(() => {
    const low = seedProducts.filter((p) => p.stock < 10);
    if (!low.length) return;
    const p = low[Math.floor(Math.random() * low.length)];
    notificationsApi.push({
      type: "stock",
      title: `Low stock: ${p.name}`,
      desc: `Only ${p.stock} units remaining (SKU ${p.sku})`,
    });
  }, 38000);
}
