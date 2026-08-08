import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pb-6 sm:flex sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-[28px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function KpiCard({
  label, value, delta, icon: Icon, format = "number",
}: {
  label: string;
  value: number;
  delta?: number;
  icon: LucideIcon;
  format?: "number" | "currency" | "percent";
}) {
  const formatted =
    format === "currency"
      ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
      : format === "percent"
        ? `${value.toFixed(2)}%`
        : value.toLocaleString();
  const positive = (delta ?? 0) >= 0;
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-elegant)] transition hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{formatted}</div>
      {typeof delta === "number" && (
        <div className={cn("mt-1.5 inline-flex items-center gap-1 text-xs font-medium", positive ? "text-[color:var(--success)]" : "text-destructive")}>
          {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
          {positive ? "+" : ""}{delta}% vs last period
        </div>
      )}
    </div>
  );
}

export function SectionCard({
  title, description, action, children, className,
}: { title: string; description?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {

  return (
    <div className={cn("rounded-xl border border-border bg-card shadow-[var(--shadow-elegant)]", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    delivered: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    approved: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    active: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    shipped: "bg-[color:var(--info)]/10 text-[color:var(--info)]",
    processing: "bg-[color:var(--info)]/10 text-[color:var(--info)]",
    pending: "bg-[color:var(--warning)]/15 text-[color:oklch(0.48_0.16_75)]",
    scheduled: "bg-[color:var(--warning)]/15 text-[color:oklch(0.48_0.16_75)]",
    draft: "bg-muted text-muted-foreground",
    archived: "bg-muted text-muted-foreground",
    paused: "bg-muted text-muted-foreground",
    hidden: "bg-muted text-muted-foreground",
    invited: "bg-accent text-accent-foreground",
    failed: "bg-destructive/10 text-destructive",
    cancelled: "bg-destructive/10 text-destructive",
    rejected: "bg-destructive/10 text-destructive",
    returned: "bg-destructive/10 text-destructive",
    refunded: "bg-muted text-muted-foreground",
    visible: "bg-[color:var(--success)]/10 text-[color:var(--success)]",
    churned: "bg-destructive/10 text-destructive",
    vip: "bg-primary/10 text-primary",
    regular: "bg-muted text-muted-foreground",
    new: "bg-[color:var(--info)]/10 text-[color:var(--info)]",
  };
  const safeStatus = status || "unknown";
  const key = safeStatus.toLowerCase();
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize", map[key] ?? "bg-muted text-muted-foreground")}>
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {safeStatus}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 p-10 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-background text-muted-foreground shadow-sm">∅</div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
