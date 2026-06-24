import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  DollarSign, ShoppingBag, Users, Package, Clock, AlertTriangle, Percent, Receipt,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  kpis, revenueSeries, categorySplit, customerGrowth, topProducts, orders, inventoryAlerts,
} from "@/lib/mock-data";
import { KpiCard, PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Dashboard"
        description="Welcome back, Elena. Here's how Northwind is performing today."
        actions={
          <>
            <Tabs defaultValue="30d">
              <TabsList className="h-9">
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
                <TabsTrigger value="90d">90d</TabsTrigger>
                <TabsTrigger value="1y">1y</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" className="h-9">Export</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Revenue" value={kpis.revenue.value} delta={kpis.revenue.delta} icon={DollarSign} format="currency" />
        <KpiCard label="Total Orders" value={kpis.orders.value} delta={kpis.orders.delta} icon={ShoppingBag} />
        <KpiCard label="Total Customers" value={kpis.customers.value} delta={kpis.customers.delta} icon={Users} />
        <KpiCard label="Total Products" value={kpis.products.value} delta={kpis.products.delta} icon={Package} />
        <KpiCard label="Pending Orders" value={kpis.pending.value} delta={kpis.pending.delta} icon={Clock} />
        <KpiCard label="Low Stock" value={kpis.lowStock.value} delta={kpis.lowStock.delta} icon={AlertTriangle} />
        <KpiCard label="Conversion Rate" value={kpis.conversion.value} delta={kpis.conversion.delta} icon={Percent} format="percent" />
        <KpiCard label="Avg Order Value" value={kpis.aov.value} delta={kpis.aov.delta} icon={Receipt} format="currency" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Revenue" description="Monthly gross revenue trend" className="lg:col-span-2"
          action={<Button variant="ghost" size="sm" className="text-xs text-muted-foreground">Last 12 months</Button>}>
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <AreaChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Sales by category" description="Last 30 days share">
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categorySplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {categorySplit.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                </Pie>
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Sales analytics" description="Orders volume by month">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Customer growth" description="New vs returning, last 8 weeks">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart data={customerGrowth} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="new" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="returning" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard title="Top selling products" description="By units sold this month" className="lg:col-span-2"
          action={<Button variant="ghost" size="sm" asChild><Link to="/products">View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></Link></Button>}>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">{i + 1}</div>
                <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category} · {p.sales} sold</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">${p.price}</p>
                  <p className="text-xs text-muted-foreground">{p.stock} in stock</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Inventory alerts" description="Items at or below reorder point"
          action={<Button variant="ghost" size="sm" asChild><Link to="/inventory">Manage</Link></Button>}>
          <div className="space-y-3">
            {inventoryAlerts.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">SKU {p.sku}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${p.stock === 0 ? "bg-destructive/10 text-destructive" : "bg-[color:var(--warning)]/15 text-[color:oklch(0.48_0.16_75)]"}`}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </div>
            ))}
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
              {orders.slice(0, 6).map((o) => (
                <TableRow key={o.id}>
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
                  <TableCell><StatusBadge status={o.payment} /></TableCell>
                  <TableCell><StatusBadge status={o.fulfillment} /></TableCell>
                  <TableCell className="text-right font-medium">${o.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
