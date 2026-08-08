import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  DollarSign, ShoppingBag, Users, Package, Clock, AlertTriangle, Percent, Receipt,
  ArrowUpRight, AlertCircle, FileDown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { KpiCard, PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsApi } from "@/api/analyticsApi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Northwind Admin" },
      { name: "description", content: "Real-time overview of revenue, orders, customers, and inventory." },
    ],
  }),
  component: DashboardPage,
});

const chartColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function DashboardPage() {
  const [period, setPeriod] = useState("30d");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => analyticsApi.getDashboard({ period }),
  });

  const handleExport = async () => {
    try {
      const res = await analyticsApi.exportReport({ period });
      const contentType = res.headers["content-type"];
      if (contentType?.includes("application/json")) {
        // If it's JSON, download it as a JSON file
        const text = await res.data.text();
        const blob = new Blob([text], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${period}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Assume PDF or CSV blob
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${period}.${contentType?.includes("csv") ? "csv" : "pdf"}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6 animate-pulse">
        <div className="flex h-16 items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-80 w-full lg:col-span-2 rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Failed to load dashboard</h3>
        <p className="text-muted-foreground mb-4">There was a problem fetching the analytics data.</p>
        <Button onClick={() => refetch()}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Dashboard"
        description="Welcome back, Elena. Here's how Northwind is performing today."
        actions={
          <>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList className="h-9">
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
                <TabsTrigger value="90d">90d</TabsTrigger>
                <TabsTrigger value="1y">1y</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" className="h-9" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Revenue" value={data.kpis.totalRevenue.value} delta={data.kpis.totalRevenue.changePercentage} icon={DollarSign} format="currency" />
        <KpiCard label="Total Orders" value={data.kpis.totalOrders.value} delta={data.kpis.totalOrders.changePercentage} icon={ShoppingBag} />
        <KpiCard label="Total Customers" value={data.kpis.totalCustomers.value} delta={data.kpis.totalCustomers.changePercentage} icon={Users} />
        <KpiCard label="Total Products" value={data.kpis.totalProducts.value} delta={data.kpis.totalProducts.changePercentage} icon={Package} />
        <KpiCard label="Pending Orders" value={data.kpis.pendingOrders.value} delta={data.kpis.pendingOrders.changePercentage} icon={Clock} />
        <KpiCard label="Low Stock" value={data.kpis.lowStock.value} delta={data.kpis.lowStock.changePercentage} icon={AlertTriangle} />
        <KpiCard label="Conversion Rate" value={data.kpis.conversionRate.value} delta={data.kpis.conversionRate.changePercentage} icon={Percent} format="percent" />
        <KpiCard label="Avg Order Value" value={data.kpis.avgOrderValue.value} delta={data.kpis.avgOrderValue.changePercentage} icon={Receipt} format="currency" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Revenue" description={`Gross revenue trend (${period})`} className="lg:col-span-2">
          {data.revenueTrend?.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <AreaChart data={data.revenueTrend} margin={{ left: -10, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">No revenue data</div>
          )}
        </SectionCard>

        <SectionCard title="Sales by category" description="Share over selected period">
          {data.salesByCategory?.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={data.salesByCategory} dataKey="value" nameKey="category" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {data.salesByCategory.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex h-72 items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">No category data</div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Sales analytics" description="Orders volume trend">
          {data.ordersByMonth?.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={data.ordersByMonth} margin={{ left: -10, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="flex h-64 items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">No orders data</div>
          )}
        </SectionCard>

        <SectionCard title="Customer growth" description="New vs returning trend">
          {data.customerGrowth?.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer>
                <LineChart data={data.customerGrowth} margin={{ left: -10, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="period" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="newCustomers" name="New" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="returningCustomers" name="Returning" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">No customer data</div>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Top selling products" description="By units sold" className="lg:col-span-2"
          action={<Button variant="ghost" size="sm" asChild><Link to="/products">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button>}>
          <div className="space-y-3">
            {data.topSellingProducts?.length > 0 ? data.topSellingProducts.slice(0, 5).map((p: any, i: number) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">{i + 1}</div>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · {p.unitsSold} sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${p.price}</p>
                  <p className="text-xs text-muted-foreground">${p.revenue.toLocaleString()} rev</p>
                </div>
              </div>
            )) : <div className="py-4 text-center text-sm text-muted-foreground">No top products</div>}
          </div>
        </SectionCard>

        <SectionCard title="Inventory alerts" description="Items at or below reorder point"
          action={<Button variant="ghost" size="sm" asChild><Link to="/inventory">Manage</Link></Button>}>
          <div className="space-y-3">
            {data.inventoryAlerts?.length > 0 ? data.inventoryAlerts.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">SKU {p.sku}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${p.stockCount === 0 ? "bg-destructive/10 text-destructive" : "bg-[color:var(--warning)]/15 text-[color:oklch(0.48_0.16_75)]"}`}>
                  {p.stockCount === 0 ? "Out of stock" : `${p.stockCount} left`}
                </span>
              </div>
            )) : <div className="py-4 text-center text-sm text-muted-foreground">No alerts</div>}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Recent orders" description="Latest activity across all channels" className="mt-6"
        action={<Button variant="ghost" size="sm" asChild><Link to="/orders">All orders <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button>}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentOrders?.length > 0 ? data.recentOrders.slice(0, 6).map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <Link to="/orders/$id" params={{ id: o.id.replace("#", "") }} className="hover:text-primary">{o.orderNumber}</Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{o.customerName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.date}</TableCell>
                  <TableCell><StatusBadge status={o.paymentStatus.toLowerCase()} /></TableCell>
                  <TableCell><StatusBadge status={o.fulfillmentStatus.toLowerCase()} /></TableCell>
                  <TableCell className="text-right font-medium">${o.amount.toFixed(2)}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No recent orders</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
