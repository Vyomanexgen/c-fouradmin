import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createBanner, updateBanner, Banner } from "@/api/marketingApi";
import { useToast } from "@/context/ToastContext";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  imageUrl: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  mobileImageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  targetUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  deepLink: z.string().optional(),
  placement: z.string().min(1, "Placement is required"),
  displayOrder: z.coerce.number().min(0).default(0),
  deviceTarget: z.enum(["all", "desktop", "mobile"]).default("all"),
  status: z.enum(["active", "inactive", "scheduled"]).default("active"),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerFormProps {
  initialData?: Banner;
  isEdit?: boolean;
}

export function BannerForm({ initialData, isEdit }: BannerFormProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const [imageUrlPreview, setImageUrlPreview] = useState(initialData?.imageUrl || "");

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      imageUrl: initialData?.imageUrl || "",
      mobileImageUrl: initialData?.mobileImageUrl || "",
      targetUrl: initialData?.targetUrl || "",
      deepLink: initialData?.deepLink || "",
      placement: initialData?.placement || "home_hero",
      displayOrder: initialData?.displayOrder || 0,
      deviceTarget: (initialData?.deviceTarget as any) || "all",
      status: (initialData?.status as any) || "active",
    },
  });

  const formImageUrl = form.watch("imageUrl");
  useEffect(() => {
    setImageUrlPreview(formImageUrl);
  }, [formImageUrl]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        subtitle: initialData.subtitle || "",
        imageUrl: initialData.imageUrl || "",
        mobileImageUrl: initialData.mobileImageUrl || "",
        targetUrl: initialData.targetUrl || "",
        deepLink: initialData.deepLink || "",
        placement: initialData.placement || "home_hero",
        displayOrder: initialData.displayOrder || 0,
        deviceTarget: (initialData.deviceTarget as any) || "all",
        status: (initialData.status as any) || "active",
      });
      setImageUrlPreview(initialData.imageUrl || "");
    }
  }, [initialData, form]);

  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["marketingStats"] });
      toast.success("Banner created successfully");
      navigate({ to: "/content" });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg || "Failed to create banner");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: BannerFormValues) => updateBanner(initialData?._id || initialData?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      queryClient.invalidateQueries({ queryKey: ["marketingStats"] });
      toast.success("Banner updated successfully");
      navigate({ to: "/content" });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg || "Failed to update banner");
    }
  });

  const onSubmit = (values: BannerFormValues) => {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-[1000px]">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link to="/content"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to content</Link>
      </Button>
      <PageHeader
        title={isEdit ? "Edit Banner" : "Add a new banner"}
        description={isEdit ? "Update your promotional banner." : "Create a new banner for your storefront."}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/content" })}>Cancel</Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Banner"}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Banner Details">
              <div className="grid gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Banner Title *</FormLabel><FormControl><Input placeholder="e.g. Summer Sale 2026 Hero" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="subtitle" render={({ field }) => (
                  <FormItem><FormLabel>Subtitle (Optional)</FormLabel><FormControl><Input placeholder="e.g. Up to 50% off" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </SectionCard>

            <SectionCard title="Media & Links">
              <div className="grid gap-4">
                <FormField control={form.control} name="imageUrl" render={({ field }) => (
                  <FormItem><FormLabel>Image URL *</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                {imageUrlPreview && (
                  <div className="mt-2 flex aspect-[21/9] flex-col items-center justify-center rounded-lg border bg-secondary/40 overflow-hidden">
                    <img src={imageUrlPreview} alt="Preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
                {!imageUrlPreview && (
                  <div className="mt-2 flex aspect-[21/9] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/40 text-center text-xs text-muted-foreground">
                    <ImageIcon className="mb-1 h-5 w-5" />
                    No Image Preview
                  </div>
                )}

                <FormField control={form.control} name="mobileImageUrl" render={({ field }) => (
                  <FormItem><FormLabel>Mobile Image URL (Optional)</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="targetUrl" render={({ field }) => (
                    <FormItem><FormLabel>Target URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="deepLink" render={({ field }) => (
                    <FormItem><FormLabel>Mobile App Deep Link (Optional)</FormLabel><FormControl><Input placeholder="myapp://..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Configuration">
              <div className="grid gap-4">
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="placement" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placement *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="home_hero">Home - Hero</SelectItem>
                        <SelectItem value="home_featured">Home - Featured</SelectItem>
                        <SelectItem value="category_top">Category - Top</SelectItem>
                        <SelectItem value="popup">Popup / Modal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="deviceTarget" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Target</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Devices</SelectItem>
                        <SelectItem value="desktop">Desktop Only</SelectItem>
                        <SelectItem value="mobile">Mobile Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="displayOrder" render={({ field }) => (
                  <FormItem><FormLabel>Display Order (Priority)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </SectionCard>
          </div>
        </form>
      </Form>
    </div>
  );
}
