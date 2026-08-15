import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Search, Edit2, Trash2, Loader2, Star, Image as ImageIcon } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ExportMenu } from "@/components/export-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, deleteProduct, ProductResponse } from "@/api/productApi";
import { getCategories, CategoryResponse } from "@/api/categoryApi";
import { useState, useMemo } from "react";
import { useToast } from "@/context/ToastContext";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/useDebounce";
export const Route = createFileRoute("/products/")({
  head: () => ({ meta: [{ title: "Products — Northwind Admin" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [categoryId, setCategoryId] = useState("all");
  const [status, setStatus] = useState("any");
  const [stockStatus, setStockStatus] = useState("any");

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch Categories for Filter
  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => getCategories(),
  });

  const categories = categoriesResponse?.categories || [];
  
  const flattenCategories = (cats: CategoryResponse[], prefix = ""): CategoryResponse[] => {
    let result: CategoryResponse[] = [];
    cats.forEach(c => {
      result.push({ ...c, name: prefix + c.name });
      if (c.subCategories && c.subCategories.length > 0) {
        result = result.concat(flattenCategories(c.subCategories, prefix + "— "));
      }
    });
    return result;
  };
  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", debouncedSearch, categoryId, status, stockStatus],
    queryFn: () => getProducts({
      q: debouncedSearch || undefined,
      categoryId: categoryId === "all" ? undefined : categoryId,
      status: status === "any" ? undefined : status,
      stockStatus: stockStatus === "any" ? undefined : stockStatus,
    }),
  });

  const products: ProductResponse[] = productsData?.products || [];

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully.");
      setIsDeleteOpen(false);
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete product");
    }
  });

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader
        title="Products"
        description={`${products.length} products found`}
        actions={
          <>
            {products.length > 0 && (
              <ExportMenu
                rows={products.map(p => ({
                  id: p._id || p.id,
                  name: p.name,
                  sku: p.defaultVariant?.sku || "",
                  category: p.category?.name || "",
                  price: p.defaultVariant?.offerPrice || p.defaultVariant?.originalPrice || 0,
                  stock: p.totalStock || 0,
                  status: p.status,
                }))}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "name", label: "Name" },
                  { key: "sku", label: "SKU" },
                  { key: "category", label: "Category" },
                  { key: "price", label: "Price", format: (r) => `₹${r.price}` },
                  { key: "stock", label: "Stock" },
                  { key: "status", label: "Status" },
                ]}
                filename="products"
                title="Products"
              />
            )}
            <Button asChild size="sm" className="h-9">
              <Link to="/products/new"><Plus className="mr-1.5 h-4 w-4" />Add product</Link>
            </Button>
          </>
        }
      />

      <SectionCard title="All products" description="Manage your catalog">
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search by name, SKU…" 
              className="h-9 pl-8" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {flatCategories.map(c => {
                const val = String(c._id || c.id || Math.random());
                return <SelectItem key={val} value={val}>{c.name || "Unnamed"}</SelectItem>;
              })}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Any status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select value={stockStatus} onValueChange={setStockStatus}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Any stock" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any stock</SelectItem>
              <SelectItem value="in_stock">In stock</SelectItem>
              <SelectItem value="low_stock">Low stock</SelectItem>
              <SelectItem value="out_of_stock">Out of stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState 
            title="No Products Found"
            description="Try adjusting your filters or create a new product."
            action={
              <Button size="sm" asChild>
                <Link to="/products/new">Add Product</Link>
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"><Checkbox /></TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Total Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => {
                  const id = p._id || p.id!;
                  const primaryImage = p.images?.[0] || p.defaultVariant?.images?.[0];
                  const sku = p.defaultVariant?.sku || "—";
                  const price = p.defaultVariant?.offerPrice || p.defaultVariant?.originalPrice || 0;
                  const originalPrice = p.defaultVariant?.originalPrice || price;
                  
                  return (
                    <TableRow key={id} className="hover:bg-muted/40">
                      <TableCell><Checkbox /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <img src={primaryImage} alt="" className="h-10 w-10 rounded-lg object-cover border" />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{sku}</TableCell>
                      <TableCell>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">
                          {p.category?.name || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {p.defaultVariant?.offerPrice && p.defaultVariant.offerPrice < originalPrice ? (
                          <div className="flex flex-col items-end leading-tight">
                            <span className="font-medium">₹{price.toFixed(2)}</span>
                            <span className="text-xs text-muted-foreground line-through">₹{originalPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span className="font-medium">₹{price.toFixed(2)}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={
                          (p.totalStock || 0) === 0 ? "font-medium text-destructive" : 
                          (p.totalStock || 0) < 10 ? "font-medium text-[color:var(--warning)]" : 
                          "text-muted-foreground"
                        }>
                          {p.totalStock || 0}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={p.status || "draft"} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <Link to="/products/$id" params={{ id: id || "unknown" }}><Edit2 className="h-4 w-4 text-muted-foreground" /></Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => confirmDelete(id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product and all its variants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <Button 
              variant="destructive" 
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
