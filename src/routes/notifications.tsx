import { createFileRoute } from "@tanstack/react-router";
import { notifications } from "@/lib/mock-data";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertTriangle, CreditCard, MessageSquare, RefreshCw } from "lucide-react";

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
} as const;

function NotificationsPage() {
  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader title="Notifications" description="Recent activity across your store"
        actions={<Button variant="outline" size="sm">Mark all as read</Button>} />

      <SectionCard title="All notifications">
        <div className="divide-y divide-border">
          {notifications.map((n) => {
            const Icon = iconMap[n.type as keyof typeof iconMap] ?? ShoppingCart;
            return (
              <div key={n.id} className="flex items-start gap-3 py-3">
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
                {n.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
