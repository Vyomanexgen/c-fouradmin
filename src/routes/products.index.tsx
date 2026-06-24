import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Filter, Download, Star } from "lucide-react";
import { products } from "@/lib/mock-data";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/products/")({
  head: () => ({ meta: [{ title: "Products — Northwind Admin" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Products"
        description={`${products.length} products across 6 categories`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Download className="mr-1.5 h-4 w-4" />Export</Button>
            <Button asChild size="sm" className="h-9"><Link to="/products/new"><Plus className="mr-1.5 h-4 w-4" />Add product</Link></Button>
          </>
        }
      />

      <SectionCard title="All products" description="Manage your catalog">
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, SKU…" className="h-9 pl-8" />
          </div>
          <Select defaultValue="all"><SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="home">Home</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="any"><SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any stock</SelectItem>
              <SelectItem value="in">In stock</SelectItem>
              <SelectItem value="low">Low stock</SelectItem>
              <SelectItem value="out">Out of stock</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-9"><Filter className="mr-1.5 h-4 w-4" />More</Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"><Checkbox /></TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/40">
                  <TableCell><Checkbox /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{p.sku}</TableCell>
                  <TableCell><span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{p.category}</span></TableCell>
                  <TableCell className="text-right">
                    {p.salePrice ? (
                      <div className="flex flex-col items-end leading-tight">
                        <span className="font-medium">${p.salePrice}</span>
                        <span className="text-xs text-muted-foreground line-through">${p.price}</span>
                      </div>
                    ) : <span className="font-medium">${p.price}</span>}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={p.stock === 0 ? "font-medium text-destructive" : p.stock < 10 ? "font-medium text-[color:oklch(0.48_0.16_75)]" : "text-muted-foreground"}>
                      {p.stock}
                    </span>
                  </TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 fill-current text-[color:var(--warning)]" />
                      {p.rating.toFixed(1)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
