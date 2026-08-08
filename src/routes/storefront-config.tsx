import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStorefrontConfig, updateStorefrontConfig, queryKeys } from "@/api/storefrontApi";
import { PageHeader, SectionCard, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

const bannerSchema = z.object({
  image: z.string().url({ message: "Must be a valid image URL" }).min(1, "Image is required"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  link: z.string().optional(),
  ctaText: z.string().optional(),
  isActive: z.boolean().default(true),
});

const quickLinkSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().min(1, "URL is required"),
});

const socialLinkSchema = z.object({
  platform: z.enum(["Instagram", "Facebook", "Twitter", "LinkedIn", "YouTube"], {
    errorMap: () => ({ message: "Must be a valid platform" })
  }),
  url: z.string().url({ message: "Must be a valid URL" }),
});

const storefrontSchema = z.object({
  heroSection: z.object({
    banners: z.array(bannerSchema).default([]),
    featuredProductIds: z.array(z.string()).default([]),
  }).default({ banners: [], featuredProductIds: [] }),
  aboutUs: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    image: z.string().url({ message: "Must be a valid image URL" }).min(1, "Image is required"),
  }).default({ title: "", description: "", image: "" }),
  footer: z.object({
    quickLinks: z.array(quickLinkSchema).max(10, "Maximum 10 quick links allowed").default([]),
    contactUs: z.object({
      address: z.string().min(1, "Address is required"),
      phone: z.string().min(1, "Phone is required"),
      email: z.string().email("Must be a valid email").min(1, "Email is required"),
      hours: z.string().min(1, "Hours is required"),
    }).default({ address: "", phone: "", email: "", hours: "" }),
    copyrightText: z.string().min(1, "Copyright text is required"),
  }).default({ quickLinks: [], contactUs: { address: "", phone: "", email: "", hours: "" }, copyrightText: "" }),
  socialLinks: z.array(socialLinkSchema).default([]),
});

type StorefrontFormValues = z.infer<typeof storefrontSchema>;

export const Route = createFileRoute("/storefront-config")({
  head: () => ({ meta: [{ title: "Storefront Config — Admin Console" }] }),
  component: StorefrontConfigPage,
});

function StorefrontConfigPage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: configData, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.storefrontConfig,
    queryFn: getStorefrontConfig,
  });

  const form = useForm<StorefrontFormValues>({
    resolver: zodResolver(storefrontSchema),
    defaultValues: {
      heroSection: { banners: [], featuredProductIds: [] },
      aboutUs: { title: "", description: "", image: "" },
      footer: { quickLinks: [], contactUs: { address: "", phone: "", email: "", hours: "" }, copyrightText: "" },
      socialLinks: [],
    }
  });

  const { isDirty } = form.formState;

  // Prompt before unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (configData?.data) {
      form.reset(configData.data);
    }
  }, [configData, form]);

  const updateMutation = useMutation({
    mutationFn: updateStorefrontConfig,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.storefrontConfig });
      form.reset(res.data);
      toast.success("Storefront configuration updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update storefront configuration.");
    }
  });

  const onSubmit = (values: StorefrontFormValues) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <EmptyState 
          title="Failed to load configuration" 
          description="There was an error loading the storefront configuration."
          action={<Button onClick={() => refetch()}>Retry</Button>}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Storefront Configuration" 
          description="Manage public website content including banners, about us, and footer links." 
        />
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={!isDirty || updateMutation.isPending}
        >
          {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About Us</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-8">
          <TabsContent value="hero">
            <HeroBannersEditor form={form} />
          </TabsContent>
          <TabsContent value="about">
            <AboutUsEditor form={form} />
          </TabsContent>
          <TabsContent value="footer">
            <FooterEditor form={form} />
          </TabsContent>
          <TabsContent value="social">
            <SocialLinksEditor form={form} />
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}

// Subcomponents

function HeroBannersEditor({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "heroSection.banners",
  });

  return (
    <SectionCard title="Hero Banners" description="Manage the rotating banners on the home page.">
      <div className="space-y-6">
        {fields.map((field, index) => {
          const imageVal = form.watch(`heroSection.banners.${index}.image`);
          return (
            <div key={field.id} className="relative rounded-lg border border-border p-4 bg-muted/20">
              <div className="absolute top-4 right-4">
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Image URL *</Label>
                    <Input {...form.register(`heroSection.banners.${index}.image`)} placeholder="https://..." />
                    {form.formState.errors.heroSection?.banners?.[index]?.image && (
                      <p className="text-sm text-destructive">{form.formState.errors.heroSection.banners[index].image.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input {...form.register(`heroSection.banners.${index}.title`)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtitle</Label>
                    <Input {...form.register(`heroSection.banners.${index}.subtitle`)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Link URL</Label>
                      <Input {...form.register(`heroSection.banners.${index}.link`)} />
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Text</Label>
                      <Input {...form.register(`heroSection.banners.${index}.ctaText`)} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch 
                      checked={form.watch(`heroSection.banners.${index}.isActive`)} 
                      onCheckedChange={(val) => form.setValue(`heroSection.banners.${index}.isActive`, val, { shouldDirty: true })} 
                    />
                    <Label>Active</Label>
                  </div>
                </div>
                <div className="border border-border rounded-lg flex items-center justify-center bg-background overflow-hidden h-[250px]">
                  {imageVal ? (
                    <img src={imageVal} alt="Banner preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                  ) : null}
                  <div className={`flex flex-col items-center text-muted-foreground ${imageVal ? 'hidden' : ''}`}>
                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                    <span className="text-sm">Image Preview</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <Button type="button" variant="outline" onClick={() => append({ image: "", isActive: true })}>
          <Plus className="h-4 w-4 mr-2" /> Add Banner
        </Button>
      </div>
    </SectionCard>
  );
}

function AboutUsEditor({ form }: { form: any }) {
  const imageVal = form.watch("aboutUs.image");
  return (
    <SectionCard title="About Us Section" description="Content for the About Us section on the storefront.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input {...form.register("aboutUs.title")} />
            {form.formState.errors.aboutUs?.title && <p className="text-sm text-destructive">{form.formState.errors.aboutUs.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea {...form.register("aboutUs.description")} className="h-32" />
            {form.formState.errors.aboutUs?.description && <p className="text-sm text-destructive">{form.formState.errors.aboutUs.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Image URL *</Label>
            <Input {...form.register("aboutUs.image")} placeholder="https://..." />
            {form.formState.errors.aboutUs?.image && <p className="text-sm text-destructive">{form.formState.errors.aboutUs.image.message}</p>}
          </div>
        </div>
        <div className="border border-border rounded-lg flex items-center justify-center bg-muted/20 overflow-hidden h-[300px]">
          {imageVal ? (
            <img src={imageVal} alt="About preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
          ) : null}
          <div className={`flex flex-col items-center text-muted-foreground ${imageVal ? 'hidden' : ''}`}>
            <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
            <span className="text-sm">Image Preview</span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function FooterEditor({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "footer.quickLinks",
  });

  return (
    <div className="space-y-6">
      <SectionCard title="Contact Info" description="Displayed in the footer.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Address *</Label>
            <Input {...form.register("footer.contactUs.address")} />
            {form.formState.errors.footer?.contactUs?.address && <p className="text-sm text-destructive">{form.formState.errors.footer.contactUs.address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input {...form.register("footer.contactUs.phone")} />
            {form.formState.errors.footer?.contactUs?.phone && <p className="text-sm text-destructive">{form.formState.errors.footer.contactUs.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" {...form.register("footer.contactUs.email")} />
            {form.formState.errors.footer?.contactUs?.email && <p className="text-sm text-destructive">{form.formState.errors.footer.contactUs.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Hours *</Label>
            <Input {...form.register("footer.contactUs.hours")} />
            {form.formState.errors.footer?.contactUs?.hours && <p className="text-sm text-destructive">{form.formState.errors.footer.contactUs.hours.message}</p>}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Quick Links" description="Manage helpful links in the footer (max 10).">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <Input {...form.register(`footer.quickLinks.${index}.name`)} placeholder="Link Name (e.g., Privacy Policy)" />
                {form.formState.errors.footer?.quickLinks?.[index]?.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.footer.quickLinks[index].name.message}</p>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input {...form.register(`footer.quickLinks.${index}.url`)} placeholder="URL (e.g., /privacy)" />
                {form.formState.errors.footer?.quickLinks?.[index]?.url && (
                  <p className="text-sm text-destructive">{form.formState.errors.footer.quickLinks[index].url.message}</p>
                )}
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {fields.length < 10 && (
            <Button type="button" variant="outline" onClick={() => append({ name: "", url: "" })}>
              <Plus className="h-4 w-4 mr-2" /> Add Quick Link
            </Button>
          )}
        </div>
      </SectionCard>
      
      <SectionCard title="Copyright" description="Bottom text of the footer.">
        <div className="space-y-2">
          <Label>Copyright Text *</Label>
          <Input {...form.register("footer.copyrightText")} placeholder="© 2026 Northwind." />
          {form.formState.errors.footer?.copyrightText && <p className="text-sm text-destructive">{form.formState.errors.footer.copyrightText.message}</p>}
        </div>
      </SectionCard>
    </div>
  );
}

function SocialLinksEditor({ form }: { form: any }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "socialLinks",
  });

  return (
    <SectionCard title="Social Links" description="Links to your social media profiles.">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-4">
            <div className="w-[200px] space-y-2">
              <Select 
                value={form.watch(`socialLinks.${index}.platform`)} 
                onValueChange={(val) => form.setValue(`socialLinks.${index}.platform`, val, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Twitter">Twitter</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="YouTube">YouTube</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.socialLinks?.[index]?.platform && (
                <p className="text-sm text-destructive">{form.formState.errors.socialLinks[index].platform.message}</p>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Input {...form.register(`socialLinks.${index}.url`)} placeholder="https://..." />
              {form.formState.errors.socialLinks?.[index]?.url && (
                <p className="text-sm text-destructive">{form.formState.errors.socialLinks[index].url.message}</p>
              )}
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => append({ platform: "Instagram", url: "" })}>
          <Plus className="h-4 w-4 mr-2" /> Add Social Link
        </Button>
      </div>
    </SectionCard>
  );
}
