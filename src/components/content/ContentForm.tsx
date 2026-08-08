import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContentItem, updateContentItem, ContentItem } from "@/api/contentApi";
import { useToast } from "@/context/ToastContext";

const contentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  type: z.enum(["blog", "page", "faq", "policy"]),
  category: z.string().optional(),
  author: z.object({
    name: z.string().optional(),
  }).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
  }).optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

type ContentFormValues = z.infer<typeof contentSchema>;

interface ContentFormProps {
  initialData?: ContentItem;
  isEdit?: boolean;
}

export function ContentForm({ initialData, isEdit }: ContentFormProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      type: (initialData?.type as any) || "blog",
      category: initialData?.category || "",
      author: {
        name: initialData?.author?.name || "",
      },
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      seo: {
        metaTitle: initialData?.seo?.metaTitle || "",
        metaDescription: initialData?.seo?.metaDescription || "",
      },
      status: (initialData?.status as any) || "draft",
    },
  });

  // Slug auto-generation
  const titleValue = form.watch("title");
  useEffect(() => {
    if (!isEdit && titleValue) {
      const generatedSlug = titleValue.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  }, [titleValue, isEdit, form]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title || "",
        slug: initialData.slug || "",
        type: (initialData.type as any) || "blog",
        category: initialData.category || "",
        author: {
          name: initialData.author?.name || "",
        },
        excerpt: initialData.excerpt || "",
        content: initialData.content || "",
        seo: {
          metaTitle: initialData.seo?.metaTitle || "",
          metaDescription: initialData.seo?.metaDescription || "",
        },
        status: (initialData.status as any) || "draft",
      });
    }
  }, [initialData, form]);

  const createMutation = useMutation({
    mutationFn: createContentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content created successfully");
      navigate({ to: "/content" });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg || "Failed to create content");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: ContentFormValues) => updateContentItem(initialData?._id || initialData?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content updated successfully");
      navigate({ to: "/content" });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg || "Failed to update content");
    }
  });

  const onSubmit = (values: ContentFormValues) => {
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
        title={isEdit ? "Edit Content" : "Add new content"}
        description={isEdit ? "Update your content page or blog post." : "Create a new blog post, page, FAQ, or policy."}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/content" })}>Cancel</Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Content"}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Content Details">
              <div className="grid gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="e.g. 10 Summer Wardrobe Tips" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="excerpt" render={({ field }) => (
                  <FormItem><FormLabel>Excerpt (Optional)</FormLabel><FormControl><Textarea rows={2} placeholder="A short summary of the content..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </SectionCard>

            <SectionCard title="Body">
              <div className="grid gap-4">
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content (HTML format)</FormLabel>
                    <FormControl><Textarea rows={15} className="font-mono text-sm" placeholder="<h1>Heading</h1><p>Paragraph...</p>" {...field} /></FormControl>
                    <FormDescription>For the MVP, raw HTML is used. This can be upgraded to a Rich Text Editor later.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </SectionCard>

            <SectionCard title="SEO Metadata">
              <div className="grid gap-4">
                <FormField control={form.control} name="seo.metaTitle" render={({ field }) => (
                  <FormItem><FormLabel>Meta Title</FormLabel><FormControl><Input placeholder="Overrides page title in search results" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="seo.metaDescription" render={({ field }) => (
                  <FormItem><FormLabel>Meta Description</FormLabel><FormControl><Textarea rows={3} placeholder="Brief description for search engines..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>URL Slug *</FormLabel><FormControl><Input placeholder="e.g. 10-summer-wardrobe-tips" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
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
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="blog">Blog Post</SelectItem>
                        <SelectItem value="page">Landing Page</SelectItem>
                        <SelectItem value="faq">FAQ</SelectItem>
                        <SelectItem value="policy">Policy / Terms</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem><FormLabel>Category (Optional)</FormLabel><FormControl><Input placeholder="e.g. Fashion, Support" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="author.name" render={({ field }) => (
                  <FormItem><FormLabel>Author Name (Optional)</FormLabel><FormControl><Input placeholder="e.g. Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </SectionCard>
          </div>
        </form>
      </Form>
    </div>
  );
}
