import { createFileRoute } from "@tanstack/react-router";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Funnel, FunnelChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList,
} from "recharts";
import { revenueSeries, categorySplit } from "@/lib/mock-data";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Northwind Admin" }] }),
  component: AnalyticsPage,
});

const funnel = [
  { name: "Visited", value: 100000, fill: "var(--chart-1)" },
  { name: "Viewed product", value: 62000, fill: "var(--chart-2)" },
  { name: "Added to cart", value: 21000, fill: "var(--chart-3)" },
  { name: "Checked out", value: 9200, fill: "var(--chart-4)" },
  { name: "Purchased", value: 3420, fill: "var(--chart-5)" },
];

const heat = Array.from({ length: 7 }, (_, d) =>
  Array.from({ length: 24 }, (_, h) => Math.round(Math.abs(Math.sin((d + 1) * (h + 1) * 0.13)) * 100)),
);
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Analytics" description="Performance, funnels, and segmentation"
        actions={
          <>
            <Tabs defaultValue="30d"><TabsList className="h-9"><TabsTrigger value="7d">7d</TabsTrigger><TabsTrigger value="30d">30d</TabsTrigger><TabsTrigger value="90d">90d</TabsTrigger></TabsList></Tabs>
            <Button variant="outline" size="sm" className="h-9">Export PDF</Button>
          </>
        } />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Revenue trend">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <AreaChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <defs><linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} fill="url(#rev2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Orders by month">
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="orders" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Conversion funnel">
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <FunnelChart>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                <Funnel dataKey="value" data={funnel} isAnimationActive>
                  <LabelList position="right" fill="var(--foreground)" stroke="none" fontSize={12} dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Category share">
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={categorySplit} dataKey="value" nameKey="name" outerRadius={100}>
                  {categorySplit.map((_, i) => <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Order activity heatmap" description="Hour of day × day of week" className="mt-6">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex">
              <div className="w-10" />
              {Array.from({ length: 24 }).map((_, h) => <div key={h} className="w-6 text-center text-[10px] text-muted-foreground">{h}</div>)}
            </div>
            {heat.map((row, d) => (
              <div key={d} className="flex items-center">
                <div className="w-10 text-xs text-muted-foreground">{days[d]}</div>
                {row.map((v, h) => (
                  <div key={h} className="m-0.5 h-5 w-5 rounded-sm" style={{ background: `oklch(0.52 0.22 277 / ${0.08 + (v / 100) * 0.7})` }} title={`${v}`} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
