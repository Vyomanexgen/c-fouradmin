import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { getOrders } from "@/api/orderApi";
import { useDebounce } from "@/hooks/useDebounce";

export const Route = createFileRoute("/orders/")({
  head: () => ({ meta: [{ title: "Orders — Northwind Admin" }] }),
  component: OrdersPage,
});

const filters = ["All", "processed", "processing", "shipped", "delivered", "cancelled", "returned", "refunded"];

function OrdersPage() {
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["orders", { page, limit, search: debouncedQuery }],
    queryFn: () => getOrders({ 
      page, 
      limit, 
      search: debouncedQuery || undefined
      // Temporarily removed status filter from API call to prevent 400 Bad Request
      // We will filter client-side until the backend enum is confirmed.
    }),
  });

  const allOrders = Array.isArray(data?.orders) ? data.orders : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const orders = tab === "All" ? allOrders : allOrders.filter(o => {
    const s = String(o.status || o.orderStatus || o.fulfillment || "").toLowerCase();
    return s === tab.toLowerCase() || s.replace(/_/g, ' ') === tab.toLowerCase();
  });
  
  const total = data?.pagination?.total || data?.pagination?.totalItems || data?.total || allOrders.length || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Orders"
        description={`${total} total orders · live updates on`}
      />

      <SectionCard title="All orders">
        <Tabs value={tab} onValueChange={(val) => { setTab(val); setPage(1); }} className="mb-4">
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
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
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
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">Loading orders...</TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-destructive">Failed to load orders.</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No orders found.</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && orders.map((o) => {
                const orderIdStr = String(o._id || o.id || o.orderNumber);
                return (
                  <TableRow key={orderIdStr} className="hover:bg-muted/40">
                    <TableCell><Checkbox /></TableCell>
                    <TableCell className="font-medium">
                      <Link to="/orders/$id" params={{ id: orderIdStr.replace("#", "") }} className="hover:text-primary">{o.orderNumber || orderIdStr}</Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm truncate max-w-[120px]">{o.customer?.name || o.customer?.firstName || o.customerName || o.shippingAddress?.fullName || o.shippingAddress?.firstName || o.billingAddress?.name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[120px]">{o.customer?.email || o.email || o.shippingAddress?.email || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : o.date ? new Date(o.date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {Array.isArray(o.items) ? o.items.reduce((sum: number, i: any) => sum + (i.quantity || 1), 0) : (o.items || 0)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{(o.totalAmount || o.amount || (Array.isArray(o.items) ? o.items.reduce((sum: number, i: any) => sum + ((i.offerPriceAtPurchase || i.originalPriceAtPurchase || 0) * (i.quantity || 1)), 0) : 0)).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={(o.paymentInfo?.status || o.paymentStatus || o.payment || "unpaid").replace(/_/g, ' ')} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={(o.status || o.orderStatus || o.fulfillment || "pending").replace(/_/g, ' ')} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing page {page} of {Math.max(1, totalPages)} ({total} total orders)
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>

      </SectionCard>
    </div>
  );
}
