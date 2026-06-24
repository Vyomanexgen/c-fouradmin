import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, PackageX, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { inventoryAlerts, products } from "@/lib/mock-data";
import { KpiCard, PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Northwind Admin" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const lowCount = products.filter((p) => p.stock < 10 && p.stock > 0).length;
  const outCount = products.filter((p) => p.stock === 0).length;
  const inCount = products.filter((p) => p.stock >= 10).length;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Inventory" description="Monitor stock levels and adjust quantities"
        actions={<><Button variant="outline" size="sm"><ArrowUpFromLine className="mr-1.5 h-4 w-4" />Receive stock</Button><Button size="sm"><ArrowDownToLine className="mr-1.5 h-4 w-4" />Adjust</Button></>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="In stock" value={inCount} icon={ArrowUpFromLine} />
        <KpiCard label="Low stock" value={lowCount} icon={AlertTriangle} />
        <KpiCard label="Out of stock" value={outCount} icon={PackageX} />
        <KpiCard label="Total SKUs" value={products.length} icon={ArrowDownToLine} />
      </div>

      <SectionCard title="Inventory alerts" description="Items at or below reorder point" className="mt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Current</TableHead>
                <TableHead className="text-right">Reorder at</TableHead>
                <TableHead className="text-right">Incoming</TableHead>
                <TableHead className="w-48">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryAlerts.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-9 w-9 rounded-md object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell className={`text-right font-medium ${p.stock === 0 ? "text-destructive" : "text-[color:oklch(0.48_0.16_75)]"}`}>{p.stock}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.reorder}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{p.incoming || "—"}</TableCell>
                  <TableCell><Progress value={Math.min(100, (p.stock / p.reorder) * 100)} className="h-2" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
