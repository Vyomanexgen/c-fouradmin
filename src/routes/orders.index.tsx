import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ExportMenu } from "@/components/export-menu";
import { useOrders } from "@/lib/realtime-store";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "Orders — Northwind Admin" }] }),
  component: OrdersPage,
});

const filters = ["All", "pending", "processing", "shipped", "delivered", "cancelled", "returned", "refunded"];

function OrdersPage() {
  const orders = useOrders();
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "All" && o.fulfillment !== tab) return false;
      if (!q) return true;
      return o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
    });
  }, [orders, tab, query]);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Orders"
        description={`${orders.length} orders this period · live updates on`}
        actions={
          <ExportMenu
            rows={filtered}
            allRows={orders}
            columns={[
              { key: "id", label: "Order ID" },
              { key: "customer", label: "Customer" },
              { key: "email", label: "Email" },
              { key: "date", label: "Date" },
              { key: "items", label: "Items" },
              { key: "amount", label: "Amount", format: (r) => `$${r.amount.toFixed(2)}` },
              { key: "payment", label: "Payment" },
              { key: "fulfillment", label: "Fulfillment" },
            ]}
            filename="orders"
            title="Orders"
            dateKey="date"
          />

        }
      />

      <SectionCard title="All orders">
        <Tabs value={tab} onValueChange={setTab} className="mb-4">
          <TabsList className="h-9 flex-wrap">
            {filters.map((f) => <TabsTrigger key={f} value={f} className="capitalize">{f}</TabsTrigger>)}
          </TabsList>
        </Tabs>
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by order ID, customer, email…"
              className="h-9 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9"><Filter className="mr-1.5 h-4 w-4" />Filters</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox /></TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id} className="hover:bg-muted/40">
                  <TableCell><Checkbox /></TableCell>
                  <TableCell className="font-medium">
                    <Link to="/orders/$id" params={{ id: o.id.replace("#", "") }} className="hover:text-primary">{o.id}</Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{o.customer}</span>
                      <span className="text-xs text-muted-foreground">{o.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="text-right text-sm">{o.items}</TableCell>
                  <TableCell className="text-right font-medium">${o.amount.toFixed(2)}</TableCell>
                  <TableCell><StatusBadge status={o.payment} /></TableCell>
                  <TableCell><StatusBadge status={o.fulfillment} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
