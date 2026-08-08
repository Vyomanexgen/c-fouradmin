import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createVariant, updateVariant, deleteVariant, Variant } from "@/api/productApi";
import { useToast } from "@/context/ToastContext";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/ui-kit";

const variantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  originalPrice: z.coerce.number().min(0.01, "Price must be > 0"),
  offerPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  stockQuantity: z.coerce.number().min(0, "Stock must be >= 0").int(),
  isActive: z.boolean().default(true),
  attributes: z.array(z.object({
    key: z.string().min(1),
    value: z.string().min(1)
  })).optional(),
});

type VariantFormValues = z.infer<typeof variantSchema>;

interface VariantManagerProps {
  productId: string;
  variants: Variant[];
}

export function VariantManager({ productId, variants }: VariantManagerProps) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<VariantFormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      sku: "",
      originalPrice: 0,
      offerPrice: "",
      stockQuantity: 0,
      isActive: true,
      attributes: [],
    },
  });

  const resetForm = () => {
    form.reset({
      sku: "",
      originalPrice: 0,
      offerPrice: "",
      stockQuantity: 0,
      isActive: true,
      attributes: [],
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const startAdd = () => {
    resetForm();
    setIsAdding(true);
  };

  const startEdit = (variant: Variant) => {
    resetForm();
    form.reset({
      sku: variant.sku,
      originalPrice: variant.originalPrice,
      offerPrice: variant.offerPrice || "",
      stockQuantity: variant.stockQuantity,
      isActive: variant.isActive !== false,
      attributes: variant.attributes || [],
    });
    setEditingId(variant._id || variant.id!);
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["product", productId] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const createMutation = useMutation({
    mutationFn: createVariant,
    onSuccess: () => {
      invalidate();
      toast.success("Variant added successfully.");
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to add variant");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, payload: Partial<Variant> }) => updateVariant(data.id, data.payload),
    onSuccess: () => {
      invalidate();
      toast.success("Variant updated successfully.");
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update variant");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVariant,
    onSuccess: () => {
      invalidate();
      toast.success("Variant deleted successfully.");
      setIsDeleteOpen(false);
      setDeletingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to delete variant");
    }
  });

  const onSubmit = (values: VariantFormValues) => {
    const payload = {
      ...values,
      offerPrice: values.offerPrice === "" || values.offerPrice === values.originalPrice ? undefined : Number(values.offerPrice),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate({ ...payload, productId });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // Filter out the default variant if we want, or show all.
  // The default variant typically doesn't have explicit attributes if it's auto-generated.
  const explicitVariants = variants.filter(v => v.attributes && v.attributes.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Manage explicit variants (sizes, colors, etc.)</p>
        <Button variant="outline" size="sm" onClick={startAdd} disabled={isAdding || !!editingId}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Variant
        </Button>
      </div>

      {(isAdding || editingId) && (
        <div className="rounded-lg border p-4 bg-muted/20">
          <h4 className="mb-4 text-sm font-medium">{editingId ? "Edit Variant" : "New Variant"}</h4>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="grid gap-1.5">
              <Label>SKU</Label>
              <Input {...form.register("sku")} placeholder="SKU-VAR-1" />
              {form.formState.errors.sku && <span className="text-xs text-destructive">{form.formState.errors.sku.message}</span>}
            </div>
            <div className="grid gap-1.5">
              <Label>Price</Label>
              <Input type="number" step="0.01" {...form.register("originalPrice")} />
              {form.formState.errors.originalPrice && <span className="text-xs text-destructive">{form.formState.errors.originalPrice.message}</span>}
            </div>
            <div className="grid gap-1.5">
              <Label>Sale Price</Label>
              <Input type="number" step="0.01" {...form.register("offerPrice")} />
            </div>
            <div className="grid gap-1.5">
              <Label>Stock</Label>
              <Input type="number" {...form.register("stockQuantity")} />
            </div>
          </div>
          
          <div className="mt-4 grid gap-1.5">
            <Label>Attributes (e.g. Size: M, Color: Red)</Label>
            <div className="flex items-center gap-2">
              <Input placeholder="Key (e.g. Size)" id="attr-key" className="w-[120px]" />
              <Input placeholder="Value (e.g. M)" id="attr-value" className="w-[120px]" />
              <Button type="button" variant="secondary" size="sm" onClick={() => {
                const keyInput = document.getElementById("attr-key") as HTMLInputElement;
                const valInput = document.getElementById("attr-value") as HTMLInputElement;
                if (keyInput.value && valInput.value) {
                  const currentAttr = form.getValues("attributes") || [];
                  form.setValue("attributes", [...currentAttr, { key: keyInput.value, value: valInput.value }]);
                  keyInput.value = "";
                  valInput.value = "";
                }
              }}>Add</Button>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {(form.watch("attributes") || []).map((attr, idx) => (
                <div key={idx} className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-xs">
                  <span className="font-medium">{attr.key}:</span> {attr.value}
                  <button type="button" className="ml-1 text-muted-foreground hover:text-destructive" onClick={() => {
                    const newAttrs = [...(form.getValues("attributes") || [])];
                    newAttrs.splice(idx, 1);
                    form.setValue("attributes", newAttrs);
                  }}><X className="h-3 w-3" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.watch("isActive")} onCheckedChange={(val) => form.setValue("isActive", val)} />
              <Label className="text-xs">Active variant</Label>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
              <Button type="button" size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Variant
              </Button>
            </div>
          </div>
        </div>
      )}

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant Details</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {variants.map((v) => {
                const id = v._id || v.id!;
                const price = v.offerPrice || v.originalPrice;
                const isDefault = !v.attributes || v.attributes.length === 0;
                
                return (
                  <TableRow key={id} className="hover:bg-muted/40">
                    <TableCell>
                      {isDefault ? (
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded">Default Variant</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {v.attributes?.map((attr, idx) => (
                            <span key={idx} className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium">
                              {attr.key}: {attr.value}
                            </span>
                          ))}
                        </div>
                      )}
                      {!v.isActive && <span className="ml-2 text-[10px] text-destructive">Inactive</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{v.sku}</TableCell>
                    <TableCell className="text-right font-medium">${price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{v.stockQuantity}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(v)}>
                          <Edit2 className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => confirmDelete(id)} disabled={isDefault && variants.length === 1}>
                          <Trash2 className="h-3 w-3" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Variant?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the variant.
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
