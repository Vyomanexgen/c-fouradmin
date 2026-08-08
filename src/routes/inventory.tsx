import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, PackageX, ArrowDownToLine, ArrowUpFromLine, Search, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KpiCard, PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getInventory, adjustStock, receiveStock } from "@/api/inventoryApi";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/context/ToastContext";
import { useDebounce } from "@/hooks/useDebounce";

export const Route = createFileRoute("/inventory")({
  head: () => ({ meta: [{ title: "Inventory — Northwind Admin" }] }),
  component: InventoryPage,
});

function InventoryPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["inventory", { page, limit, search: debouncedSearch, status: statusFilter }],
    queryFn: () => getInventory({ 
      page, 
      limit, 
      search: debouncedSearch || undefined, 
      status: statusFilter === "all" ? undefined : statusFilter 
    }),
  });

  const adjustMutation = useMutation({
    mutationFn: ({ id, quantity, reason }: { id: string, quantity: number, reason: string }) => adjustStock(id, { quantity, reason }),
    onSuccess: () => {
      toast.success("Stock adjusted successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to adjust stock");
    }
  });

  const receiveMutation = useMutation({
    mutationFn: ({ id, quantity, costPerUnit }: { id: string, quantity: number, costPerUnit: number }) => receiveStock(id, { quantity, costPerUnit }),
    onSuccess: () => {
      toast.success("Stock received successfully");
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to receive stock");
    }
  });

  const items = Array.isArray(data?.inventory) ? data.inventory : Array.isArray(data?.products) ? data.products : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  const total = data?.pagination?.totalItems || data?.total || items.length || 0;
  const totalPages = Math.ceil(total / limit);

  // Stats for the KPIs (in a real app, these might come from a separate aggregate endpoint, 
  // but for now we'll just show placeholders or calculate from current page if that's all we have)
  const inCount = items.filter((p) => p.status === "in_stock").length;
  const lowCount = items.filter((p) => p.status === "low_stock").length;
  const outCount = items.filter((p) => p.status === "out_of_stock").length;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Inventory"
        description="Monitor stock levels and adjust quantities"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="In stock (Page)" value={inCount} icon={ArrowUpFromLine} />
        <KpiCard label="Low stock (Page)" value={lowCount} icon={AlertTriangle} />
        <KpiCard label="Out of stock (Page)" value={outCount} icon={PackageX} />
        <KpiCard label="Total Items" value={total} icon={ArrowDownToLine} />
      </div>

      <SectionCard
        title="Inventory levels"
        description="Current stock across all SKUs"
        className="mt-6"
      >
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by SKU..."
              className="h-9 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[180px]">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Loading inventory...</TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-destructive">Failed to load inventory.</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No inventory items found.</TableCell>
                </TableRow>
              )}
              {!isLoading && !isError && items.map((p, idx) => {
                const itemId = p.id || `item-${idx}`; // Fallback if API doesn't return id
                return (
                  <TableRow key={itemId} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs font-medium">{p.sku}</TableCell>
                    <TableCell className="text-right font-medium">{p.quantity}</TableCell>
                    <TableCell>
                      {p.status === "in_stock" && <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700">In Stock</Badge>}
                      {p.status === "low_stock" && <Badge variant="secondary" className="bg-amber-500/15 text-amber-700">Low Stock</Badge>}
                      {p.status === "out_of_stock" && <Badge variant="destructive">Out of Stock</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Adjust Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">Adjust</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Adjust Stock for {p.sku}</DialogTitle>
                              <DialogDescription>Manually correct the stock count for this item (e.g. damaged goods).</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              adjustMutation.mutate({ 
                                id: itemId, 
                                quantity: Number(formData.get("quantity")), 
                                reason: String(formData.get("reason")) 
                              });
                              // In a real app we'd close the dialog here
                            }}>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="quantity">Quantity Adjustment (e.g. -1)</Label>
                                  <Input id="quantity" name="quantity" type="number" required />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="reason">Reason</Label>
                                  <Input id="reason" name="reason" placeholder="Damaged in warehouse" required />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={adjustMutation.isPending}>Submit Adjustment</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>

                        {/* Receive Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm">Receive</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Receive Shipment for {p.sku}</DialogTitle>
                              <DialogDescription>Add new incoming stock to the inventory.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const formData = new FormData(e.currentTarget);
                              receiveMutation.mutate({ 
                                id: itemId, 
                                quantity: Number(formData.get("quantity")), 
                                costPerUnit: Number(formData.get("costPerUnit")) 
                              });
                            }}>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="receive_quantity">Quantity Received</Label>
                                  <Input id="receive_quantity" name="quantity" type="number" min="1" required />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="costPerUnit">Cost Per Unit ($)</Label>
                                  <Input id="costPerUnit" name="costPerUnit" type="number" step="0.01" min="0" required />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="submit" disabled={receiveMutation.isPending}>Receive Stock</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Showing page {page} of {Math.max(1, totalPages)} ({total} total items)
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>

      </SectionCard>
    </div>
  );
}
