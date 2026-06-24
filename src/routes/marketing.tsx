import { createFileRoute } from "@tanstack/react-router";
import { Mail, Bell as BellIcon, Image as ImageIcon, Gift, Plus } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/marketing")({
  head: () => ({ meta: [{ title: "Marketing — Northwind Admin" }] }),
  component: MarketingPage,
});

const campaigns = [
  { name: "June newsletter", channel: "Email", sent: 18402, opened: "32%", clicked: "5.8%", status: "delivered" },
  { name: "Flash sale push", channel: "Push", sent: 9120, opened: "61%", clicked: "12.4%", status: "active" },
  { name: "Cart abandonment", channel: "Email", sent: 1284, opened: "44%", clicked: "9.1%", status: "active" },
  { name: "VIP early access", channel: "Email", sent: 412, opened: "78%", clicked: "21.0%", status: "scheduled" },
];

function MarketingPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Marketing" description="Email, push, and referral programs"
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />New campaign</Button>} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Email", icon: Mail, value: "18.4k", sub: "subscribers" },
          { label: "Push", icon: BellIcon, value: "9.1k", sub: "devices" },
          { label: "Banners", icon: ImageIcon, value: "12", sub: "live" },
          { label: "Referrals", icon: Gift, value: "284", sub: "this month" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Campaigns" description="All marketing campaigns across channels" className="mt-6">
        <div className="divide-y divide-border">
          {campaigns.map((c) => (
            <div key={c.name} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.channel} · {c.sent.toLocaleString()} recipients</p>
              </div>
              <span className="hidden text-xs text-muted-foreground sm:inline">Open <span className="font-medium text-foreground">{c.opened}</span></span>
              <span className="hidden text-xs text-muted-foreground sm:inline">Click <span className="font-medium text-foreground">{c.clicked}</span></span>
              <StatusBadge status={c.status} />
              <Button variant="ghost" size="sm">View</Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
