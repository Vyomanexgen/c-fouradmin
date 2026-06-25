import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Plus, Pencil, Trash2, RotateCcw, RefreshCw, LogIn, Download, FileText,
} from "lucide-react";
import { useAuditLog, type AuditAction } from "@/lib/realtime-store";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ExportMenu } from "@/components/export-menu";

export const Route = createFileRoute("/audit-logs")({
  head: () => ({ meta: [{ title: "Audit Logs — Northwind Admin" }] }),
  component: AuditLogsPage,
});

const ACTION_META: Record<AuditAction, { label: string; icon: typeof Plus; tone: string }> = {
  create: { label: "Create", icon: Plus, tone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  edit: { label: "Edit", icon: Pencil, tone: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  delete: { label: "Delete", icon: Trash2, tone: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
  refund: { label: "Refund", icon: RotateCcw, tone: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  status_change: { label: "Status change", icon: RefreshCw, tone: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  login: { label: "Login", icon: LogIn, tone: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  export: { label: "Export", icon: Download, tone: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" },
};

function formatTimestamp(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function AuditLogsPage() {
  const entries = useAuditLog();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (action !== "all" && e.action !== action) return false;
      if (!q) return true;
      return (
        e.actor.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q)
      );
    });
  }, [entries, query, action]);

  const exportRows = filtered.map((e) => ({
    timestamp: formatTimestamp(e.timestamp),
    actor: e.actor,
    action: ACTION_META[e.action].label,
    entity: e.entity,
    detail: e.detail,
  }));

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Audit Logs"
        description="Every admin action across the platform — create, edit, delete, refund, status changes."
        actions={
          <ExportMenu
            rows={exportRows}
            columns={[
              { key: "timestamp", label: "Timestamp" },
              { key: "actor", label: "Actor" },
              { key: "action", label: "Action" },
              { key: "entity", label: "Entity" },
              { key: "detail", label: "Detail" },
            ]}
            filename="audit-logs"
            title="Audit Logs"
          />
        }
      />

      <SectionCard title="Activity timeline" description={`${filtered.length} of ${entries.length} events`}>
        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by actor, entity, detail…"
              className="h-9 pl-8"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {Object.entries(ACTION_META).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="grid place-items-center rounded-lg border border-dashed border-border py-16 text-sm text-muted-foreground">
            <FileText className="mb-2 h-6 w-6" />
            No audit entries match your filters.
          </div>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-6">
            {filtered.map((e) => {
              const meta = ACTION_META[e.action];
              const Icon = meta.icon;
              return (
                <li key={e.id} className="relative">
                  <span className={`absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full ring-4 ring-background ${meta.tone}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="rounded-lg border border-border bg-card p-3 transition hover:border-primary/40">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{e.actor}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{meta.label}</Badge>
                      <span className="text-sm text-muted-foreground">→ {e.entity}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{formatTimestamp(e.timestamp)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{e.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </SectionCard>
    </div>
  );
}
