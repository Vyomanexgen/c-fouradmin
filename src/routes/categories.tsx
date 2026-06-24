import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { categoriesList } from "@/lib/mock-data";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — Northwind Admin" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Categories" description="Organize your catalog with nested categories"
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />New category</Button>} />

      <SectionCard title="All categories">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search categories…" className="h-9 pl-8 max-w-sm" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoriesList.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    {c.parent !== "—" && <span className="mr-2 text-muted-foreground">↳</span>}
                    {c.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">/{c.slug}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.parent}</TableCell>
                  <TableCell className="text-right">{c.products}</TableCell>
                  <TableCell><StatusBadge status={c.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
