import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon, ChevronRight, ChevronDown } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory, CategoryResponse } from "@/api/categoryApi";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/context/ToastContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  parentId: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — Northwind Admin" }] }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [search, setSearch] = useState("");
  
  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: categoriesResponse, isLoading } = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => getCategories(), // Fetch root categories to get subCategories
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

  const filteredCategories = useMemo(() => {
    if (!search) return flatCategories;
    const lowerSearch = search.toLowerCase();
    return flatCategories.filter(c => 
      c.name?.toLowerCase().includes(lowerSearch) || 
      (c.slug || "").toLowerCase().includes(lowerSearch)
    );
  }, [flatCategories, search]);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: "none",
      description: "",
      image: "",
      isActive: true,
    },
  });

  // Slug auto-generation
  const nameValue = form.watch("name");
  useEffect(() => {
    if (!editingCategory && nameValue) {
      const generatedSlug = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, editingCategory, form]);

  const openNewCategory = () => {
    setEditingCategory(null);
    form.reset({ name: "", slug: "", parentId: "none", description: "", image: "", isActive: true });
    setIsFormOpen(true);
  };

  const openEditCategory = (category: CategoryResponse) => {
    setEditingCategory(category);
    form.reset({
      name: (category.name || "").replace(/^—\s*/, ''), // Remove prefix if any
      slug: category.slug || "",
      parentId: category.parentId || "none",
      description: category.description || "",
      image: category.image || "",
      isActive: category.status === "visible",
    });
    setIsFormOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category created successfully.");
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      if (msg?.toLowerCase().includes("duplicate") || msg?.toLowerCase().includes("exists")) {
        toast.error("Category slug already exists.");
      } else {
        toast.error(msg || "Failed to create category");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, payload: any }) => updateCategory(data.id, data.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category updated successfully.");
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      if (msg?.toLowerCase().includes("duplicate") || msg?.toLowerCase().includes("exists")) {
        toast.error("Category slug already exists.");
      } else {
        toast.error(msg || "Failed to update category");
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted successfully.");
      setIsDeleteOpen(false);
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete category");
    }
  });

  const onSubmit = (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      parentId: values.parentId === "none" ? undefined : values.parentId,
      description: values.description,
      image: values.image,
      status: values.isActive ? "visible" : "hidden" as "visible" | "hidden"
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id || editingCategory.id!, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader 
        title="Categories" 
        description="Organize your catalog with nested categories"
        actions={
          <Button size="sm" onClick={openNewCategory}>
            <Plus className="mr-1.5 h-4 w-4" />New category
          </Button>
        } 
      />

      <SectionCard title="All categories">
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search categories…" 
            className="h-9 pl-8 max-w-sm" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <EmptyState 
            title={search ? "No matches found" : "No Categories Found"}
            description={search ? "Try adjusting your search term" : "Create your first category to organize your products."}
            action={!search && <Button size="sm" onClick={openNewCategory}>Create Category</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((c) => (
                  <TableRow key={c._id || c.id} className="hover:bg-muted/40">
                    <TableCell>
                      {c.image ? (
                        <img src={c.image} alt={c.name} className="h-8 w-8 rounded-md object-cover border" />
                      ) : (
                        <div className="h-8 w-8 rounded-md bg-secondary flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">/{c.slug}</TableCell>
                    <TableCell className="text-right">{c.productsCount || 0}</TableCell>
                    <TableCell>
                      <StatusBadge status={c.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditCategory(c)}>
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => confirmDelete(c._id || c.id!)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory ? "Update the category details below." : "Add a new category to your store catalog."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Electronics" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="parentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None (Root Category)</SelectItem>
                        {categories.map((c) => {
                          const val = String(c._id || c.id || Math.random());
                          return (!editingCategory || (String(c._id || c.id) !== String(editingCategory._id || editingCategory.id))) && (
                            <SelectItem key={val} value={val}>{c.name || "Unnamed"}</SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. electronics" {...field} />
                    </FormControl>
                    <FormDescription>The URL-friendly version of the name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Category description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active Status</FormLabel>
                      <FormDescription>
                        Active categories will be visible on the storefront.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCategory ? "Save Changes" : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
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
