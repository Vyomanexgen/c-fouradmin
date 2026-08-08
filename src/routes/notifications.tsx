import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart, AlertTriangle, CreditCard, MessageSquare, RefreshCw, Bell,
  Check, BellOff, Trash2,
} from "lucide-react";
import { notificationApi, NotificationItem } from "@/api/notificationApi";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Northwind Admin" }] }),
  component: NotificationsPage,
});

const iconMap: Record<string, React.ElementType> = {
  order: ShoppingCart,
  inventory: AlertTriangle,
  stock: AlertTriangle,
  payment: CreditCard,
  message: MessageSquare,
  refund: RefreshCw,
  system: Bell,
};

const TABS = [
  { value: "all", label: "All", type: undefined },
  { value: "orders", label: "Orders", type: "order" },
  { value: "inventory", label: "Inventory", type: "inventory" },
  { value: "messages", label: "Messages", type: "message" },
];

function NotificationsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("all");
  
  // Local state for muting categories (persisted to localStorage in a real app)
  const [muted, setMuted] = useState<Record<string, boolean>>({});

  const activeTab = TABS.find((t) => t.value === tab)!;

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", activeTab.type],
    queryFn: () => notificationApi.getNotifications({ type: activeTab.type }),
    refetchInterval: 30000,
  });

  const notifications = useMemo(() => {
    return (data?.data || []).filter((n: NotificationItem) => !muted[n.type]);
  }, [data, muted]);

  const unreadCount = data?.unreadCount ?? 0;
  const totalCount = data?.total ?? 0;

  const markAsReadMut = useMutation({
    mutationFn: notificationApi.markAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllReadMut = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMut = useMutation({
    mutationFn: notificationApi.deleteNotification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const toggleMute = (type: string, isMuted: boolean) => {
    setMuted(prev => ({ ...prev, [type]: isMuted }));
  };

  return (
    <div className="mx-auto max-w-[1000px]">
      <PageHeader
        title="Notifications"
        description="Real-time activity across your store — group by channel."
        actions={
          <Button variant="outline" size="sm" onClick={() => markAllReadMut.mutate()} disabled={markAllReadMut.isPending || unreadCount === 0}>
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
              {unreadCount} unread · {totalCount} total
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

          {isLoading ? (
             <div className="space-y-4">
               {Array.from({ length: 4 }).map((_, i) => (
                 <div key={i} className="flex items-start gap-3 py-2">
                   <Skeleton className="h-9 w-9 rounded-lg" />
                   <div className="flex-1 space-y-2">
                     <Skeleton className="h-4 w-1/3" />
                     <Skeleton className="h-3 w-2/3" />
                   </div>
                 </div>
               ))}
             </div>
          ) : notifications.length === 0 ? (
            <div className="grid place-items-center rounded-lg border border-dashed border-border py-14 text-sm text-muted-foreground">
              <BellOff className="mb-2 h-6 w-6" />
              No notifications in this channel.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n: NotificationItem) => {
                const Icon = iconMap[n.type] ?? Bell;
                return (
                  <div key={n._id} className="group flex items-start gap-3 py-3 transition-colors hover:bg-muted/50 rounded-md px-2 -mx-2">
                    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${!n.isRead ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`truncate text-sm ${!n.isRead ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs"
                          onClick={() => markAsReadMut.mutate(n._id)} disabled={markAsReadMut.isPending}>
                          Mark read
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMut.mutate(n._id)} disabled={deleteMut.isPending}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Channel preferences" description="Mute settings persist on this device.">
          <div className="space-y-3">
            {Object.keys(iconMap).map((t) => {
              const Icon = iconMap[t];
              return (
                <div key={t} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <Label htmlFor={`mute-${t}`} className="flex items-center gap-2 capitalize text-sm">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    {t === "stock" ? "Low-stock alerts" : t}
                  </Label>
                  <Switch
                    id={`mute-${t}`}
                    checked={!muted[t]}
                    onCheckedChange={(v) => toggleMute(t, !v)}
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
