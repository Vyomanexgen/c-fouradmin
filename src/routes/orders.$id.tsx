import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer, RefreshCw, MoreHorizontal, MapPin, CreditCard, Truck } from "lucide-react";
import { orders } from "@/lib/mock-data";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({ meta: [{ title: "Order details — Northwind Admin" }] }),
  component: OrderDetailPage,
});

const timeline = [
  { time: "10:42 AM", text: "Order placed", done: true },
  { time: "10:43 AM", text: "Payment confirmed", done: true },
  { time: "12:18 PM", text: "Prepared for shipping", done: true },
  { time: "Today", text: "Shipped via FedEx", done: true },
  { time: "Est. Jun 26", text: "Out for delivery", done: false },
  { time: "Est. Jun 27", text: "Delivered", done: false },
];

function OrderDetailPage() {
  const { id } = Route.useParams();
  const order = orders.find((o) => o.id.replace("#", "") === id) ?? orders[0];

  return (
    <div className="mx-auto max-w-[1400px]">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link to="/orders"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to orders</Link>
      </Button>
      <PageHeader
        title={`Order ${order.id}`}
        description={`Placed on ${order.date} · ${order.items} item${order.items > 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="outline" size="sm"><Printer className="mr-1.5 h-4 w-4" />Invoice</Button>
            <Button variant="outline" size="sm"><RefreshCw className="mr-1.5 h-4 w-4" />Refund</Button>
            <Button size="sm">Mark as fulfilled</Button>
            <Button variant="ghost" size="icon" className="h-9 w-9"><MoreHorizontal className="h-4 w-4" /></Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={order.payment} />
        <StatusBadge status={order.fulfillment} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Items">
            <div className="space-y-3">
              {Array.from({ length: order.items }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <img src={`https://picsum.photos/seed/o${i}/80/80`} alt="" className="h-12 w-12 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">Product line item {i + 1}</p>
                    <p className="text-xs text-muted-foreground">SKU-0{1234 + i} · Qty 1</p>
                  </div>
                  <span className="font-medium">₹{(order.amount / order.items).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
              <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>₹{(order.amount * 0.9).toFixed(2)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Shipping</span><span>₹8.00</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Tax</span><span>₹{(order.amount * 0.05).toFixed(2)}</span></div>
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total</span><span>₹{order.amount.toFixed(2)}</span></div>
            </div>
          </SectionCard>

          <SectionCard title="Timeline">
            <ol className="relative space-y-4 border-l border-border pl-5">
              {timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[26px] grid h-3.5 w-3.5 place-items-center rounded-full border-2 ${t.done ? "border-primary bg-primary" : "border-border bg-background"}`} />
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-sm ${t.done ? "text-foreground" : "text-muted-foreground"}`}>{t.text}</span>
                    <span className="text-xs text-muted-foreground">{t.time}</span>
                  </div>
                </li>
              ))}
            </ol>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Customer">
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.customer}</p>
              <p className="text-muted-foreground">{order.email}</p>
              <p className="text-muted-foreground">+1 (555) 234-9810</p>
              <Link to="/customers" className="text-primary hover:underline">View customer profile →</Link>
            </div>
          </SectionCard>

          <SectionCard title="Shipping address">
            <div className="flex gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p>{order.customer}</p>
                <p className="text-muted-foreground">240 Spear Street, Suite 1400<br />San Francisco, CA 94105<br />United States</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Payment">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Visa ending in 4242
            </div>
          </SectionCard>

          <SectionCard title="Tracking">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="font-mono">FX 7842 9301 2287</span>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
