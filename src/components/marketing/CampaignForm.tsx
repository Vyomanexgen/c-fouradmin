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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCampaign, updateCampaign, Campaign } from "@/api/marketingApi";
import { useToast } from "@/context/ToastContext";

const campaignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  title: z.string().optional(),
  type: z.enum(["email", "push", "sms", "flash_sale", "other"]),
  channel: z.string().optional(),
  targetAudience: z.string().optional(),
  status: z.enum(["draft", "scheduled", "active", "completed", "cancelled"]).default("draft"),
  schedule: z.object({
    startDate: z.string().optional(),
  }).optional(),
  content: z.object({
    subject: z.string().optional(),
    body: z.string().optional(),
    ctaText: z.string().optional(),
  }).optional(),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface CampaignFormProps {
  initialData?: Campaign;
  isEdit?: boolean;
}

export function CampaignForm({ initialData, isEdit }: CampaignFormProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const navigate = useNavigate();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      title: initialData?.title || "",
      type: (initialData?.type as any) || "email",
      channel: initialData?.channel || "",
      targetAudience: initialData?.targetAudience || "",
      status: (initialData?.status as any) || "draft",
      schedule: {
        startDate: initialData?.schedule?.startDate || "",
      },
      content: {
        subject: initialData?.content?.subject || "",
        body: initialData?.content?.body || "",
        ctaText: initialData?.content?.ctaText || "",
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        code: initialData.code || "",
        title: initialData.title || "",
        type: (initialData.type as any) || "email",
        channel: initialData.channel || "",
        targetAudience: initialData.targetAudience || "",
        status: (initialData.status as any) || "draft",
        schedule: {
          startDate: initialData.schedule?.startDate || "",
        },
        content: {
          subject: initialData.content?.subject || "",
          body: initialData.content?.body || "",
          ctaText: initialData.content?.ctaText || "",
        },
      });
    }
  }, [initialData, form]);

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["marketingStats"] });
      toast.success("Campaign created successfully");
      navigate({ to: "/marketing" });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg || "Failed to create campaign");
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: CampaignFormValues) => updateCampaign(initialData?._id || initialData?.id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["marketingStats"] });
      toast.success("Campaign updated successfully");
      navigate({ to: "/marketing" });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message;
      toast.error(msg || "Failed to update campaign");
    }
  });

  const onSubmit = (values: CampaignFormValues) => {
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
        <Link to="/marketing"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to marketing</Link>
      </Button>
      <PageHeader
        title={isEdit ? "Edit Campaign" : "Add a new campaign"}
        description={isEdit ? "Update your marketing campaign." : "Create a new campaign to engage your audience."}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/marketing" })}>Cancel</Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Campaign"}
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Campaign Details">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Campaign Name *</FormLabel><FormControl><Input placeholder="e.g. Summer Sale 2026" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem><FormLabel>Campaign Code *</FormLabel><FormControl><Input placeholder="e.g. SUMMER26" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Internal Title (Optional)</FormLabel><FormControl><Input placeholder="Internal reference title" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="targetAudience" render={({ field }) => (
                  <FormItem><FormLabel>Target Audience</FormLabel><FormControl><Input placeholder="e.g. All users, VIP customers" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </SectionCard>

            <SectionCard title="Content & Messaging">
              <div className="grid gap-4">
                <FormField control={form.control} name="content.subject" render={({ field }) => (
                  <FormItem><FormLabel>Subject Line</FormLabel><FormControl><Input placeholder="Email subject or push title" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="content.body" render={({ field }) => (
                  <FormItem><FormLabel>Body (HTML / Text)</FormLabel><FormControl><Textarea rows={6} placeholder="Main content message..." {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="content.ctaText" render={({ field }) => (
                  <FormItem><FormLabel>Call-to-Action Text</FormLabel><FormControl><Input placeholder="e.g. Shop Now" {...field} /></FormControl><FormMessage /></FormItem>
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
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="sms">SMS</SelectItem>
                        <SelectItem value="flash_sale">Flash Sale</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="channel" render={({ field }) => (
                  <FormItem><FormLabel>Channel</FormLabel><FormControl><Input placeholder="e.g. newsletter" {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <FormField control={form.control} name="schedule.startDate" render={({ field }) => (
                  <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
            </SectionCard>
          </div>
        </form>
      </Form>
    </div>
  );
}
