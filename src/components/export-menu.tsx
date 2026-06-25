import { Download, FileSpreadsheet, FileText, FileType2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToCsv, exportToExcel, exportToPdf, type ExportColumn } from "@/lib/export-utils";
import { toast } from "sonner";

type Props<T> = {
  rows: T[];
  columns: ExportColumn<T>[];
  filename: string;
  title?: string;
  label?: string;
};

export function ExportMenu<T>({ rows, columns, filename, title, label = "Export" }: Props<T>) {
  const run = (fn: () => void, fmt: string) => {
    try {
      fn();
      toast.success(`${filename}.${fmt} downloaded`, { description: `${rows.length} rows exported` });
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Download className="mr-1.5 h-4 w-4" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Download as</DropdownMenuLabel>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
