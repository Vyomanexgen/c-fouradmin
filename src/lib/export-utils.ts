// CSV / Excel / PDF export helpers for admin tables.
// Supports column subset selection, date-range filtering, and a chunked
// "export all" path that reports background progress.
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { auditApi } from "./realtime-store";

export type ExportColumn<T> = {
  key: keyof T | string;
  label: string;
  format?: (row: T) => string | number;
};

export type ExportFormat = "csv" | "xlsx" | "pdf";

export type ExportOptions<T> = {
  rows: T[];
  columns: ExportColumn<T>[];
  filename: string;
  title?: string;
  dateKey?: keyof T | string; // for date-range filtering
  dateFrom?: string; // ISO date or yyyy-mm-dd
  dateTo?: string;
  onProgress?: (pct: number) => void; // 0..100
};

function toMatrix<T>(rows: T[], columns: ExportColumn<T>[]) {
  const header = columns.map((c) => c.label);
  const body = rows.map((row) =>
    columns.map((c) => {
      if (c.format) return c.format(row);
      const v = (row as Record<string, unknown>)[c.key as string];
      return v == null ? "" : (v as string | number);
    }),
  );
  return { header, body };
}

function filterByDate<T>(rows: T[], dateKey?: keyof T | string, from?: string, to?: string) {
  if (!dateKey || (!from && !to)) return rows;
  const fromT = from ? new Date(from).getTime() : -Infinity;
  const toT = to ? new Date(to).getTime() + 86399999 : Infinity;
  return rows.filter((r) => {
    const raw = (r as Record<string, unknown>)[dateKey as string];
    if (raw == null) return true;
    const t = new Date(String(raw)).getTime();
    if (Number.isNaN(t)) return true;
    return t >= fromT && t <= toT;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeCsv(value: unknown) {
  const s = String(value ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Yield to the event loop so the UI can paint progress between chunks.
const tick = () => new Promise<void>((r) => setTimeout(r, 0));

async function buildBody<T>(
  rows: T[],
  columns: ExportColumn<T>[],
  onProgress?: (pct: number) => void,
) {
  const header = columns.map((c) => c.label);
  const body: (string | number)[][] = [];
  const chunk = Math.max(50, Math.ceil(rows.length / 20));
  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    for (const row of slice) {
      body.push(
        columns.map((c) => {
          if (c.format) return c.format(row);
          const v = (row as Record<string, unknown>)[c.key as string];
          return v == null ? "" : (v as string | number);
        }),
      );
    }
    onProgress?.(Math.min(100, Math.round(((i + slice.length) / Math.max(1, rows.length)) * 100)));
    if (rows.length > 200) await tick();
  }
  return { header, body };
}

export async function runExport<T>(format: ExportFormat, opts: ExportOptions<T>) {
  const filtered = filterByDate(opts.rows, opts.dateKey, opts.dateFrom, opts.dateTo);
  opts.onProgress?.(2);
  const { header, body } = await buildBody(filtered, opts.columns, opts.onProgress);

  if (format === "csv") {
    const csv = [header, ...body].map((r) => r.map(escapeCsv).join(",")).join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${opts.filename}.csv`);
  } else if (format === "xlsx") {
    const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, opts.filename.slice(0, 31));
    XLSX.writeFile(wb, `${opts.filename}.xlsx`);
  } else {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text(opts.title ?? opts.filename, 14, 16);
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`Generated ${new Date().toLocaleString()} • ${filtered.length} rows`, 14, 22);
    autoTable(doc, {
      head: [header],
      body: body.map((r) => r.map((c) => String(c))),
      startY: 28,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [99, 91, 255], textColor: 255 },
      alternateRowStyles: { fillColor: [246, 249, 252] },
    });
    doc.save(`${opts.filename}.pdf`);
  }

  opts.onProgress?.(100);
  auditApi.log({
    actor: "Elena Brooks",
    action: "export",
    entity: opts.filename,
    detail: `Exported ${filtered.length} rows as ${format.toUpperCase()}`,
  });
  return filtered.length;
}

// Convenience wrappers (kept for existing call sites).
export function exportToCsv<T>(rows: T[], columns: ExportColumn<T>[], filename: string) {
  return runExport("csv", { rows, columns, filename });
}
export function exportToExcel<T>(rows: T[], columns: ExportColumn<T>[], filename: string) {
  return runExport("xlsx", { rows, columns, filename });
}
export function exportToPdf<T>(rows: T[], columns: ExportColumn<T>[], filename: string, title?: string) {
  return runExport("pdf", { rows, columns, filename, title });
}
