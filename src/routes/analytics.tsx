import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Funnel, FunnelChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList,
} from "recharts";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Activity, ShoppingCart, TrendingUp, Zap, FileDown } from "lucide-react";
import { analyticsApi } from "@/api/analyticsApi";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Northwind Admin" }] }),
  component: AnalyticsPage,
});

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function AnalyticsPage() {
  const [period, setPeriod] = useState("30d");

  const { data: overview, isLoading: overviewLoading, isError: overviewError } = useQuery({
    queryKey: ["analytics-overview", period],
    queryFn: () => analyticsApi.getOverview(),
  });

  const { data: realtime, isLoading: realtimeLoading } = useQuery({
    queryKey: ["analytics-realtime"],
    queryFn: () => analyticsApi.getRealtime(),
    refetchInterval: 30000, // Poll every 30s
  });

  const handleExport = async () => {
    try {
      const res = await analyticsApi.exportReport({ period });
      const contentType = res.headers["content-type"];
      if (contentType?.includes("application/json")) {
        const text = await res.data.text();
        const blob = new Blob([text], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${period}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${period}.${contentType?.includes("csv") ? "csv" : "pdf"}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  if (overviewLoading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-6 animate-pulse">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
           {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (overviewError || !overview) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <AlertCircle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Failed to load analytics</h3>
        <p className="text-muted-foreground mb-4">There was a problem fetching the deep dive analytics.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Analytics" description="Performance, funnels, and segmentation"
        actions={
          <>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList className="h-9">
                <TabsTrigger value="7d">7d</TabsTrigger>
                <TabsTrigger value="30d">30d</TabsTrigger>
                <TabsTrigger value="90d">90d</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" className="h-9" onClick={handleExport}>
              <FileDown className="mr-2 h-4 w-4" /> Export
            </Button>
          </>
        } />

      {/* Realtime Dashboard Section */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Real-Time Store Activity</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SectionCard className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Visitors</p>
                <p className="text-2xl font-bold">{realtimeLoading ? "-" : realtime?.activeVisitors ?? 0}</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/10 text-blue-500">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Carts</p>
                <p className="text-2xl font-bold">{realtimeLoading ? "-" : realtime?.cartSessions ?? 0}</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard className="flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sales Velocity</p>
                <p className="text-2xl font-bold">₹{realtimeLoading ? "-" : realtime?.salesVelocity ?? 0}/hr</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard className="flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2">
                <div className="grid h-6 w-6 place-items-center rounded-full bg-amber-500/10 text-amber-500">
                  <Zap className="h-3 w-3" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Live Events</p>
             </div>
             <div className="h-[40px] overflow-hidden">
                {realtimeLoading ? <Skeleton className="h-4 w-full" /> : 
                 realtime?.liveEventLog?.length > 0 ? (
                   <ul className="text-xs space-y-1 text-muted-foreground animate-in slide-in-from-bottom-2 fade-in duration-500">
                     {realtime.liveEventLog.slice(0, 2).map((log: string, i: number) => (
                       <li key={i} className="truncate">• {log}</li>
                     ))}
                   </ul>
                 ) : <span className="text-xs text-muted-foreground">No recent events</span>}
             </div>
          </SectionCard>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard title="Revenue trend">
          <div className="h-64 w-full">
            {overview.revenueTrend?.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={overview.revenueTrend} margin={{ left: -10, right: 8, top: 8 }}>
                  <defs><linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} /><stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="value" stroke="var(--chart-1)" strokeWidth={2} fill="url(#rev2)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">No data</div>}
          </div>
        </SectionCard>

        <SectionCard title="Orders by month">
          <div className="h-64 w-full">
             {overview.monthlyOrderVolume?.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={overview.monthlyOrderVolume} margin={{ left: -10, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="value" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
             ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">No data</div>}
          </div>
        </SectionCard>

        <SectionCard title="Conversion funnel">
          <div className="h-72 w-full">
            {overview.conversionFunnel?.length > 0 ? (
              <ResponsiveContainer>
                <FunnelChart>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Funnel dataKey="value" data={overview.conversionFunnel.map((d: any, i: number) => ({ ...d, fill: `var(--chart-${(i%5)+1})` }))} isAnimationActive>
                    <LabelList position="right" fill="var(--foreground)" stroke="none" fontSize={12} dataKey="name" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">No data</div>}
          </div>
        </SectionCard>

        <SectionCard title="Category share">
          <div className="h-72 w-full">
            {overview.categoryShare?.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={overview.categoryShare} dataKey="value" nameKey="name" outerRadius={100}>
                    {overview.categoryShare.map((_: any, i: number) => <Cell key={i} fill={`var(--chart-${(i % 5) + 1})`} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground border border-dashed rounded-lg">No data</div>}
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
            {overview.heatmap?.length > 0 ? overview.heatmap.map((row: number[], d: number) => (
              <div key={d} className="flex items-center">
                <div className="w-10 text-xs text-muted-foreground">{days[d]}</div>
                {row.map((v, h) => (
                  <div key={h} className="m-0.5 h-5 w-5 rounded-sm" style={{ background: `oklch(0.52 0.22 277 / ${0.08 + (v / 100) * 0.7})` }} title={`${v}`} />
                ))}
              </div>
            )) : <div className="py-8 text-center text-sm text-muted-foreground">No heatmap data available</div>}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
