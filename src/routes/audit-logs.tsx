import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Plus, Pencil, Trash2, RotateCcw, RefreshCw, LogIn, Download, FileText,
  ArrowRight, ChevronRight,
} from "lucide-react";
import {
  useAuditLog, type AuditAction, type AuditEntityType, type AuditSeverity, type AuditEntry,
} from "@/lib/realtime-store";
import { adminUsers } from "@/lib/mock-data";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportMenu } from "@/components/export-menu";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";

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

const ENTITY_TYPES: AuditEntityType[] = ["Order", "Product", "Customer", "Coupon", "Review", "User", "Export", "System"];
const SEVERITY_TONE: Record<AuditSeverity, string> = {
  info: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  critical: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function formatTimestamp(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function AuditLogsPage() {
  const entries = useAuditLog();
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("all");
  const [entityType, setEntityType] = useState("all");
  const [actor, setActor] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [selected, setSelected] = useState<AuditEntry | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (action !== "all" && e.action !== action) return false;
      if (entityType !== "all" && e.entityType !== entityType) return false;
      if (actor !== "all" && e.actor !== actor) return false;
      if (severity !== "all" && e.severity !== severity) return false;
      if (!q) return true;
      return (
        e.actor.toLowerCase().includes(q) ||
        e.entity.toLowerCase().includes(q) ||
        e.detail.toLowerCase().includes(q)
      );
    });
  }, [entries, query, action, entityType, actor, severity]);

  const exportRows = filtered.map((e) => ({
    timestamp: formatTimestamp(e.timestamp),
    actor: e.actor,
    action: ACTION_META[e.action].label,
    entity: e.entity,
    entityType: e.entityType,
    severity: e.severity,
    detail: e.detail,
  }));

  const resetFilters = () => {
    setQuery(""); setAction("all"); setEntityType("all"); setActor("all"); setSeverity("all");
  };

  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader
        title="Audit Logs"
        description="Every admin action across the platform — filter, drill into before/after values, and export."
        actions={
          <ExportMenu
            rows={exportRows}
            allRows={entries.map((e) => ({
              timestamp: formatTimestamp(e.timestamp),
              actor: e.actor,
              action: ACTION_META[e.action].label,
              entity: e.entity,
              entityType: e.entityType,
              severity: e.severity,
              detail: e.detail,
            }))}
            columns={[
              { key: "timestamp", label: "Timestamp" },
              { key: "actor", label: "Actor" },
              { key: "action", label: "Action" },
              { key: "entityType", label: "Entity type" },
              { key: "entity", label: "Entity" },
              { key: "severity", label: "Severity" },
              { key: "detail", label: "Detail" },
            ]}
            filename="audit-logs"
            title="Audit Logs"
            dateKey="timestamp"
          />
        }
      />

      <SectionCard
        title="Activity timeline"
        description={`${filtered.length} of ${entries.length} events`}
        action={
          (action !== "all" || entityType !== "all" || actor !== "all" || severity !== "all" || query) && (
            <Button variant="ghost" size="sm" className="h-8" onClick={resetFilters}>Reset filters</Button>
          )
        }
      >
        <div className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_repeat(4,160px)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search actor, entity, detail…" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Action" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              {Object.entries(ACTION_META).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={entityType} onValueChange={setEntityType}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Entity type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All entities</SelectItem>
              {ENTITY_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={actor} onValueChange={setActor}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Actor" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actors</SelectItem>
              {adminUsers.map((u) => (<SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>))}
              <SelectItem value="System">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="h-9"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severity</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
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
                  <button
                    type="button"
                    onClick={() => setSelected(e)}
                    className="block w-full rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/40 hover:shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{e.actor}</span>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{meta.label}</Badge>
                      <Badge variant="outline" className="text-[10px]">{e.entityType}</Badge>
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${SEVERITY_TONE[e.severity]}`}>{e.severity}</span>
                      <span className="text-sm text-muted-foreground">→ {e.entity}</span>
                      <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        {formatTimestamp(e.timestamp)} <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{e.detail}</p>
                  </button>
                </li>
              );
            })}
          </ol>
        )}
      </SectionCard>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="uppercase tracking-wide">{ACTION_META[selected.action].label}</Badge>
                  <Badge variant="outline">{selected.entityType}</Badge>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium capitalize ${SEVERITY_TONE[selected.severity]}`}>{selected.severity}</span>
                </SheetTitle>
                <SheetDescription>
                  {selected.actor} · {formatTimestamp(selected.timestamp)}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Entity</div>
                  <div className="mt-1 text-sm font-medium">{selected.entity}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground">Detail</div>
                  <div className="mt-1 text-sm">{selected.detail}</div>
                </div>
                {(selected.before || selected.after) && (
                  <div>
                    <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Before → After</div>
                    <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
                      <DiffBlock label="Before" data={selected.before} tone="border-rose-500/30 bg-rose-500/5" />
                      <div className="grid place-items-center text-muted-foreground"><ArrowRight className="h-4 w-4" /></div>
                      <DiffBlock label="After" data={selected.after} tone="border-emerald-500/30 bg-emerald-500/5" />
                    </div>
                  </div>
                )}
                <div className="rounded-md bg-muted/40 p-3 font-mono text-[11px] text-muted-foreground">
                  event_id: {selected.id}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DiffBlock({ label, data, tone }: { label: string; data?: Record<string, unknown>; tone: string }) {
  return (
    <div className={`rounded-md border p-2.5 ${tone}`}>
      <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      {data && Object.keys(data).length > 0 ? (
        <dl className="space-y-1 text-xs">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-mono">{String(v)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <div className="text-xs italic text-muted-foreground">—</div>
      )}
    </div>
  );
}
