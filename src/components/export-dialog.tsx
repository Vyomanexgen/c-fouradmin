import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  RadioGroup, RadioGroupItem,
} from "@/components/ui/radio-group";
import { FileText, FileSpreadsheet, FileType2, Loader2 } from "lucide-react";
import { runExport, type ExportColumn, type ExportFormat } from "@/lib/export-utils";
import { toast } from "sonner";

type Props<T> = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rows: T[];
  allRows?: T[]; // for "export all"
  columns: ExportColumn<T>[];
  filename: string;
  title?: string;
  dateKey?: keyof T | string;
};

export function ExportDialog<T>({
  open, onOpenChange, rows, allRows, columns, filename, title, dateKey,
}: Props<T>) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [scope, setScope] = useState<"filtered" | "all">("filtered");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(columns.map((c) => String(c.key))),
  );
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const handleRun = async () => {
    const cols = columns.filter((c) => selected.has(String(c.key)));
    if (!cols.length) {
      toast.error("Pick at least one column");
      return;
    }
    const data = scope === "all" && allRows ? allRows : rows;
    setRunning(true);
    setProgress(0);
    try {
      const count = await runExport(format, {
        rows: data,
        columns: cols,
        filename,
        title,
        dateKey,
        dateFrom: from || undefined,
        dateTo: to || undefined,
        onProgress: setProgress,
      });
      toast.success(`${filename}.${format} downloaded`, { description: `${count} rows exported` });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    } finally {
      setRunning(false);
      setProgress(0);
    }
  };

  const FormatIcon = format === "csv" ? FileText : format === "xlsx" ? FileSpreadsheet : FileType2;

  return (
    <Dialog open={open} onOpenChange={(v) => !running && onOpenChange(v)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FormatIcon className="h-4 w-4" /> Export {filename}
          </DialogTitle>
          <DialogDescription>Choose format, date range, and columns.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div>
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">Format</Label>
            <RadioGroup
              className="mt-2 grid grid-cols-3 gap-2"
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
            >
              {[
                { v: "csv", label: "CSV", Icon: FileText },
                { v: "xlsx", label: "Excel", Icon: FileSpreadsheet },
                { v: "pdf", label: "PDF", Icon: FileType2 },
              ].map(({ v, label, Icon }) => (
                <label
                  key={v}
                  htmlFor={`fmt-${v}`}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm transition ${format === v ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <RadioGroupItem value={v} id={`fmt-${v}`} />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {label}
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ex-from" className="text-xs uppercase tracking-wide text-muted-foreground">From</Label>
              <Input id="ex-from" type="date" className="mt-1.5 h-9" value={from} onChange={(e) => setFrom(e.target.value)} disabled={!dateKey} />
            </div>
            <div>
              <Label htmlFor="ex-to" className="text-xs uppercase tracking-wide text-muted-foreground">To</Label>
              <Input id="ex-to" type="date" className="mt-1.5 h-9" value={to} onChange={(e) => setTo(e.target.value)} disabled={!dateKey} />
            </div>
          </div>
          {!dateKey && (
            <p className="-mt-3 text-[11px] text-muted-foreground">Date range not available for this dataset.</p>
          )}

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Columns</Label>
              <div className="flex gap-2 text-xs">
                <button className="text-primary hover:underline" onClick={() => setSelected(new Set(columns.map((c) => String(c.key))))}>All</button>
                <button className="text-muted-foreground hover:underline" onClick={() => setSelected(new Set())}>None</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 rounded-md border border-border p-2 max-h-40 overflow-y-auto">
              {columns.map((c) => {
                const k = String(c.key);
                return (
                  <label key={k} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted/60">
                    <Checkbox checked={selected.has(k)} onCheckedChange={() => toggle(k)} />
                    {c.label}
                  </label>
                );
              })}
            </div>
          </div>

          {allRows && allRows.length !== rows.length && (
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Scope</Label>
              <RadioGroup className="mt-2 space-y-1.5" value={scope} onValueChange={(v) => setScope(v as "filtered" | "all")}>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="filtered" id="sc-f" /> Current filtered rows ({rows.length})
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="all" id="sc-a" /> Export all rows ({allRows.length})
                </label>
              </RadioGroup>
            </div>
          )}

          {running && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Preparing export…</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={running}>Cancel</Button>
          <Button onClick={handleRun} disabled={running}>
            {running ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Exporting…</> : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
