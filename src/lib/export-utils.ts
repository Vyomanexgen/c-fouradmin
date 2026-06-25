// CSV / Excel / PDF export helpers for admin tables.
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { auditApi } from "./realtime-store";

export type ExportColumn<T> = {
  key: keyof T | string;
  label: string;
  format?: (row: T) => string | number;
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

export function exportToCsv<T>(rows: T[], columns: ExportColumn<T>[], filename: string) {
  const { header, body } = toMatrix(rows, columns);
  const csv = [header, ...body].map((r) => r.map(escapeCsv).join(",")).join("\n");
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
  auditApi.log({ actor: "Elena Brooks", action: "export", entity: filename, detail: `Exported ${rows.length} rows as CSV` });
}

export function exportToExcel<T>(rows: T[], columns: ExportColumn<T>[], filename: string) {
  const { header, body } = toMatrix(rows, columns);
  const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, filename.slice(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
  auditApi.log({ actor: "Elena Brooks", action: "export", entity: filename, detail: `Exported ${rows.length} rows as Excel` });
}

export function exportToPdf<T>(rows: T[], columns: ExportColumn<T>[], filename: string, title?: string) {
  const { header, body } = toMatrix(rows, columns);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text(title ?? filename, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()} • ${rows.length} rows`, 14, 22);
  autoTable(doc, {
    head: [header],
    body: body.map((r) => r.map((c) => String(c))),
    startY: 28,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [99, 91, 255], textColor: 255 },
    alternateRowStyles: { fillColor: [246, 249, 252] },
  });
  doc.save(`${filename}.pdf`);
  auditApi.log({ actor: "Elena Brooks", action: "export", entity: filename, detail: `Exported ${rows.length} rows as PDF` });
}
