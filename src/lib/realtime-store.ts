// Tiny pub/sub stores for realtime mock data: notifications, audit log, orders.
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

// ---------- notifications ----------
export type NotificationItem = {
  id: string;
  type: "order" | "stock" | "payment" | "message" | "refund" | "system";
  title: string;
  desc: string;
  time: string;
  unread: boolean;
};

const notificationsStore = createStore<NotificationItem[]>(
  seedNotifications.map((n) => ({ ...n, type: n.type as NotificationItem["type"] })),
);

export function useNotifications() {
  return useSyncExternalStore(
    notificationsStore.subscribe,
    notificationsStore.get,
    notificationsStore.get,
  );
}
export const notificationsApi = {
  push: (n: Omit<NotificationItem, "id" | "time" | "unread">) =>
    notificationsStore.set((prev) => [
      { ...n, id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, time: "just now", unread: true },
      ...prev,
    ].slice(0, 50)),
  markAllRead: () =>
    notificationsStore.set((prev) => prev.map((n) => ({ ...n, unread: false }))),
  get: notificationsStore.get,
};

// ---------- audit log ----------
export type AuditAction =
  | "create" | "edit" | "delete" | "refund" | "status_change" | "login" | "export";

export type AuditEntry = {
  id: string;
  actor: string;
  action: AuditAction;
  entity: string; // e.g. "Order #ORD-4842"
  detail: string;
  timestamp: string; // ISO
};

const seedAudit: AuditEntry[] = [
  { id: "a1", actor: "Elena Brooks", action: "status_change", entity: "Order #ORD-4842", detail: "processing → shipped", timestamp: "2026-06-25T09:21:00Z" },
  { id: "a2", actor: "Marcus Wei", action: "edit", entity: "Product Aurora Wireless Headphones", detail: "Price $189 → $179", timestamp: "2026-06-25T08:58:00Z" },
  { id: "a3", actor: "Priya Shah", action: "create", entity: "Coupon SUMMER40", detail: "40% off, expires 2026-08-15", timestamp: "2026-06-24T17:42:00Z" },
  { id: "a4", actor: "Daniel Kim", action: "refund", entity: "Order #ORD-4812", detail: "Refunded $58.00 to customer", timestamp: "2026-06-24T15:10:00Z" },
  { id: "a5", actor: "Elena Brooks", action: "delete", entity: "Review rv7", detail: "Removed flagged review", timestamp: "2026-06-24T13:02:00Z" },
  { id: "a6", actor: "Marcus Wei", action: "edit", entity: "Customer Sofia Reyes", detail: "Updated shipping address", timestamp: "2026-06-24T11:30:00Z" },
  { id: "a7", actor: "Aisha Bello", action: "login", entity: "Admin session", detail: "Signed in from Chrome / macOS", timestamp: "2026-06-24T09:15:00Z" },
  { id: "a8", actor: "Priya Shah", action: "create", entity: "Product Solstice Hoodie", detail: "Added to Fashion catalog", timestamp: "2026-06-23T16:48:00Z" },
];

const auditStore = createStore<AuditEntry[]>(seedAudit);

export function useAuditLog() {
  return useSyncExternalStore(auditStore.subscribe, auditStore.get, auditStore.get);
}
export const auditApi = {
  log: (entry: Omit<AuditEntry, "id" | "timestamp">) =>
    auditStore.set((prev) => [
      { ...entry, id: `a_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, timestamp: new Date().toISOString() },
      ...prev,
    ].slice(0, 200)),
  get: auditStore.get,
};

// ---------- orders (mutable for status changes) ----------
const ordersStore = createStore<Order[]>(seedOrders);
export function useOrders() {
  return useSyncExternalStore(ordersStore.subscribe, ordersStore.get, ordersStore.get);
}
export const ordersApi = {
  setStatus: (id: string, fulfillment: OrderStatus) =>
    ordersStore.set((prev) => prev.map((o) => (o.id === id ? { ...o, fulfillment } : o))),
  get: ordersStore.get,
};

// ---------- realtime simulator (singleton) ----------
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

  // Periodically advance a random in-flight order
  setInterval(() => {
    const list = ordersStore.get();
    const candidates = list.filter((o) => STATUS_PROGRESS[o.fulfillment]);
    if (!candidates.length) return;
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const next = STATUS_PROGRESS[target.fulfillment]!;
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
      detail: `${target.fulfillment} → ${next}`,
    });
  }, 22000);

  // Periodically raise a low-stock alert
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
