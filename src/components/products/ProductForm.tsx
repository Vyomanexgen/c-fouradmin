import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Upload, Trash2, Image as ImageIcon } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, CategoryResponse } from "@/api/categoryApi";
import { createProduct, updateProduct, ProductResponse } from "@/api/productApi";
import { useToast } from "@/context/ToastContext";
import { VariantManager } from "./VariantManager";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  images: z.array(z.string().url("Must be a valid URL")).optional(),
  price: z.coerce.number().min(0.01, "Price must be > 0"),
  salePrice: z.coerce.number().min(0).optional().or(z.literal("")),
  stockQuantity: z.coerce.number().min(0, "Stock must be >= 0").int(),
  categoryId: z.string().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  pageTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: ProductResponse;
  isEdit?: boolean;
}

export function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [imageUrlInput, setImageUrlInput] = useState("");

  const { data: categoriesResponse } = useQuery({
    queryKey: ["categories", "admin"],
    queryFn: () => getCategories(),
  });

  const rootCategories = categoriesResponse?.categories || [];
  
  // Find currently selected root category to show its children
  const [selectedParentId, setSelectedParentId] = useState<string>("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      brand: initialData?.brand || "",
      sku: initialData?.defaultVariant?.sku || "",
      price: initialData?.defaultVariant?.originalPrice || 0,
      salePrice: initialData?.defaultVariant?.offerPrice || "",
      stockQuantity: initialData?.defaultVariant?.stockQuantity || 0,
      status: initialData?.status || "active",
      categoryId: initialData?.category?._id || initialData?.categoryId || "",
      pageTitle: initialData?.pageTitle || "",
      metaDescription: initialData?.metaDescription || "",
      images: initialData?.images?.length ? initialData.images : initialData?.defaultVariant?.images || [],
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        brand: initialData.brand || "",
        sku: initialData.defaultVariant?.sku || "",
        price: initialData.defaultVariant?.originalPrice || 0,
        salePrice: initialData.defaultVariant?.offerPrice || "",
        stockQuantity: initialData.defaultVariant?.stockQuantity || 0,
        status: initialData.status || "active",
        categoryId: initialData.category?._id || initialData.categoryId || "",
        pageTitle: initialData.pageTitle || "",
        metaDescription: initialData.metaDescription || "",
        images: initialData.images?.length ? initialData.images : initialData.defaultVariant?.images || [],
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    if (initialData && rootCategories.length > 0) {
      const catId = initialData.category?._id || initialData.categoryId;
      if (catId) {
        const isRoot = rootCategories.some(c => String(c._id || c.id) === String(catId));
        if (isRoot) {
          setSelectedParentId(String(catId));
        } else {
          const parent = rootCategories.find(c => c.subCategories?.some(sub => String(sub._id || sub.id) === String(catId)));
          if (parent) {
            setSelectedParentId(String(parent._id || parent.id));
          }
        }
      }
    }
  }, [initialData, rootCategories]);


  // Slug auto-generation
  const nameValue = form.watch("name");
  useEffect(() => {
    if (!isEdit && nameValue) {
      const generatedSlug = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [nameValue, isEdit, form]);

  const imagesValue = form.watch("images") || [];

  const addImage = () => {
    if (!imageUrlInput) return;
    try {
      new URL(imageUrlInput);
      form.setValue("images", [...imagesValue, imageUrlInput]);
      setImageUrlInput("");
    } catch {
      toast.error("Please enter a valid image URL");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...imagesValue];
    newImages.splice(index, 1);
    form.setValue("images", newImages);
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product created successfully");
      navigate({ to: "/products" });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      if (msg?.toLowerCase().includes("duplicate") || msg?.toLowerCase().includes("exists")) {
        toast.error("Product slug or SKU already exists.");
      } else {
        toast.error(msg || "Failed to create product");
      }
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormValues) => updateProduct(initialData?._id || initialData?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully");
      navigate({ to: "/products" });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      if (msg?.toLowerCase().includes("duplicate") || msg?.toLowerCase().includes("exists")) {
        toast.error("Product slug or SKU already exists.");
      } else {
        toast.error(msg || "Failed to update product");
      }
    }
  });

  const onSubmit = (values: ProductFormValues) => {
    // If salePrice is empty string or same as price, remove it
    if (values.salePrice === "" || values.salePrice === values.price) {
      delete values.salePrice;
    }
    
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-[1200px]">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link to="/products"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to products</Link>
      </Button>
      <PageHeader
        title={isEdit ? "Edit Product" : "Add a new product"}
        description={isEdit ? "Update your product listing." : "Create a product listing with pricing, inventory, and SEO metadata."}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/products" })}>Cancel</Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Product details">
              <div className="grid gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Product name</FormLabel><FormControl><Input placeholder="e.g. Wireless Headphones" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={5} placeholder="Describe the product..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="brand" render={({ field }) => (
                    <FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="Northwind" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem><FormLabel>SKU</FormLabel><FormControl><Input placeholder="SKU-00000" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Media (Images)">
              <div className="flex gap-2 mb-4">
                <Input 
                  placeholder="Paste image URL here..." 
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addImage();
                    }
                  }}
                />
                <Button type="button" onClick={addImage} variant="secondary">Add</Button>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {imagesValue.map((url, i) => (
                  <div key={i} className="relative group flex aspect-square flex-col items-center justify-center rounded-lg border bg-secondary/40 overflow-hidden">
                    <img src={url} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button type="button" variant="destructive" size="icon" className="h-8 w-8" onClick={() => removeImage(i)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {imagesValue.length === 0 && (
                  <div className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/40 text-center text-xs text-muted-foreground">
                    <ImageIcon className="mb-1 h-5 w-5" />
                    No Images
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Pricing & Inventory (Default Variant)">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="salePrice" render={({ field }) => (
                  <FormItem><FormLabel>Sale price (Optional)</FormLabel><FormControl><Input type="number" step="0.01" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="stockQuantity" render={({ field }) => (
                  <FormItem><FormLabel>Stock quantity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </SectionCard>

            <SectionCard title="SEO metadata">
              <div className="grid gap-4">
                <FormField control={form.control} name="pageTitle" render={({ field }) => (
                  <FormItem><FormLabel>Page title</FormLabel><FormControl><Input placeholder="Auto-generated if empty" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="metaDescription" render={({ field }) => (
                  <FormItem><FormLabel>Meta description</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>URL slug</FormLabel><FormControl><Input placeholder="e.g. wireless-headphones" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Status">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </SectionCard>

            <SectionCard title="Organization">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Parent Category</Label>
                  <Select 
                    value={selectedParentId} 
                    onValueChange={(val) => {
                      setSelectedParentId(val);
                      form.setValue("categoryId", val);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select Parent..." /></SelectTrigger>
                    <SelectContent>
                      {rootCategories.map((c) => {
                        const val = String(c._id || c.id || Math.random());
                        return <SelectItem key={val} value={val}>{c.name || "Unnamed"}</SelectItem>;
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {selectedParentId && rootCategories.find(c => String(c._id || c.id) === selectedParentId)?.subCategories?.length! > 0 && (
                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value === selectedParentId ? "" : field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Subcategory..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (Use Parent)</SelectItem>
                          {rootCategories.find(c => String(c._id || c.id) === selectedParentId)?.subCategories?.map((sub) => {
                            const val = String(sub._id || sub.id || Math.random());
                            return <SelectItem key={val} value={val}>{sub.name || "Unnamed"}</SelectItem>;
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>
            </SectionCard>
            
            {isEdit && initialData && (
              <SectionCard title="Variants">
                <VariantManager 
                  productId={initialData._id || initialData.id!} 
                  variants={initialData.variants || [initialData.defaultVariant].filter(Boolean) as any} 
                />
              </SectionCard>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
