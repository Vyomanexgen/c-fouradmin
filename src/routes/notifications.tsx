import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart, AlertTriangle, CreditCard, MessageSquare, RefreshCw, Bell,
  Check, BellOff,
} from "lucide-react";
import {
  notificationsApi, useNotifications, useMutedTypes, mutedApi,
  type NotificationType,
} from "@/lib/realtime-store";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Northwind Admin" }] }),
  component: NotificationsPage,
});

const iconMap = {
  order: ShoppingCart,
  stock: AlertTriangle,
  payment: CreditCard,
  message: MessageSquare,
  refund: RefreshCw,
  system: Bell,
} as const;

const TABS: { value: string; label: string; types: NotificationType[] }[] = [
  { value: "all", label: "All", types: ["order", "stock", "payment", "message", "refund", "system"] },
  { value: "orders", label: "Orders", types: ["order", "refund", "payment"] },
  { value: "inventory", label: "Inventory", types: ["stock"] },
  { value: "messages", label: "Messages", types: ["message", "system"] },
];

function NotificationsPage() {
  const notifications = useNotifications();
  const muted = useMutedTypes();
  const [tab, setTab] = useState("all");

  const activeTab = TABS.find((t) => t.value === tab)!;
  const filtered = useMemo(
    () => notifications.filter((n) => activeTab.types.includes(n.type)),
    [notifications, activeTab],
  );
  const unread = filtered.filter((n) => n.unread).length;

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Notifications"
        description="Real-time activity across your store — group by channel."
        actions={
          <Button variant="outline" size="sm" onClick={() => notificationsApi.markAllRead()}>
            <Check className="mr-1.5 h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <SectionCard
          title="Inbox"
          description={
            <span className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live
              </Badge>
              {unread} unread · {filtered.length} total
            </span>
          }
        >
          <Tabs value={tab} onValueChange={setTab} className="mb-4">
            <TabsList className="h-9">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value}>{t.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {filtered.length === 0 ? (
            <div className="grid place-items-center rounded-lg border border-dashed border-border py-14 text-sm text-muted-foreground">
              <BellOff className="mb-2 h-6 w-6" />
              No notifications in this channel.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((n) => {
                const Icon = iconMap[n.type] ?? ShoppingCart;
                return (
                  <div key={n.id} className="group flex items-start gap-3 py-3">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${n.unread ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-sm ${n.unread ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.desc}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      {n.unread ? (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                          onClick={() => notificationsApi.markRead(n.id)}>
                          Mark read
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                          onClick={() => notificationsApi.markUnread(n.id)}>
                          Mark unread
                        </Button>
                      )}
                    </div>
                    {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Channel preferences" description="Mute settings persist on this device.">
          <div className="space-y-3">
            {(Object.keys(iconMap) as NotificationType[]).map((t) => {
              const Icon = iconMap[t];
              return (
                <div key={t} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Label htmlFor={`mute-${t}`} className="flex items-center gap-2 capitalize">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {t === "stock" ? "Low-stock alerts" : t}
                  </Label>
                  <Switch
                    id={`mute-${t}`}
                    checked={!muted[t]}
                    onCheckedChange={(v) => mutedApi.setMuted(t, !v)}
                  />
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Muted channels stop receiving new notifications and toasts until re-enabled.
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
