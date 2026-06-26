import { useState } from "react";
import { Download, FileSpreadsheet, FileText, FileType2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCsv, exportToExcel, exportToPdf, type ExportColumn } from "@/lib/export-utils";
import { ExportDialog } from "@/components/export-dialog";
import { toast } from "sonner";

type Props<T> = {
  rows: T[];
  allRows?: T[];
  columns: ExportColumn<T>[];
  filename: string;
  title?: string;
  label?: string;
  dateKey?: keyof T | string;
};

export function ExportMenu<T>({
  rows, allRows, columns, filename, title, label = "Export", dateKey,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const run = async (fn: () => Promise<unknown> | unknown, fmt: string) => {
    try {
      await fn();
      toast.success(`${filename}.${fmt} downloaded`, { description: `${rows.length} rows exported` });
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-1.5 h-4 w-4" />
            {label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Quick download</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => run(() => exportToCsv(rows, columns, filename), "csv")}>
            <FileText className="mr-2 h-4 w-4" /> CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run(() => exportToExcel(rows, columns, filename), "xlsx")}>
            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => run(() => exportToPdf(rows, columns, filename, title), "pdf")}>
            <FileType2 className="mr-2 h-4 w-4" /> PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Settings2 className="mr-2 h-4 w-4" /> Advanced export…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ExportDialog
        open={open}
        onOpenChange={setOpen}
        rows={rows}
        allRows={allRows}
        columns={columns}
        filename={filename}
        title={title}
        dateKey={dateKey}
      />
    </>
  );
}
