import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Loader2 } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCoupon } from "@/api/couponApi";
import { useToast } from "@/context/ToastContext";

export const Route = createFileRoute("/coupons_/new")({
  head: () => ({ meta: [{ title: "New Coupon — Northwind Admin" }] }),
  component: NewCouponPage,
});

const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(20, "Code must be 20 characters or less"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().min(0, "Discount value must be positive"),
  usageLimit: z.coerce.number().min(1, "Limit must be at least 1").optional().or(z.literal("")),
  minPurchaseAmount: z.coerce.number().min(0).optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

type CouponFormValues = z.infer<typeof couponSchema>;

function NewCouponPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      usageLimit: "",
      minPurchaseAmount: "",
      startDate: "",
      endDate: "",
      isActive: true,
    },
  });

  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon created successfully");
      navigate({ to: "/coupons" });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to create coupon");
    }
  });

  const onSubmit = (values: CouponFormValues) => {
    // Clean up empty optional values
    const payload = { ...values };
    if (payload.usageLimit === "") delete payload.usageLimit;
    if (payload.minPurchaseAmount === "") delete payload.minPurchaseAmount;
    if (payload.startDate === "") delete payload.startDate;
    if (payload.endDate === "") delete payload.endDate;

    createMutation.mutate(payload as any);
  };

  const isSaving = createMutation.isPending;

  return (
    <div className="mx-auto max-w-[1000px]">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link to="/coupons"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to coupons</Link>
      </Button>
      <PageHeader
        title="Create new coupon"
        description="Set up a discount code with specific rules and usage limits."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate({ to: "/coupons" })}>Cancel</Button>
            <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Coupon
            </Button>
          </>
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SectionCard title="Coupon Details">
              <div className="grid gap-4">
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. SUMMER2024" className="uppercase" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} />
                    </FormControl>
                    <FormDescription>Customers will enter this code at checkout.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Internal)</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="Summer sale campaign for loyal customers..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </SectionCard>

            <SectionCard title="Discount Settings">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="discountType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="discountValue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </SectionCard>

            <SectionCard title="Requirements & Limits">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="minPurchaseAmount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Purchase Amount ($)</FormLabel>
                    <FormControl><Input type="number" step="0.01" min="0" placeholder="0.00" {...field} value={field.value ?? ""} /></FormControl>
                    <FormDescription>Leave blank for no minimum.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="usageLimit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Usage Limit</FormLabel>
                    <FormControl><Input type="number" min="1" placeholder="e.g. 100" {...field} value={field.value ?? ""} /></FormControl>
                    <FormDescription>Total number of times this coupon can be used across all customers.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Active Dates">
              <div className="grid gap-4">
                <FormField control={form.control} name="startDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="endDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </SectionCard>

            <SectionCard title="Status">
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>Enable or disable this coupon.</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </SectionCard>
          </div>
        </form>
      </Form>
    </div>
  );
}
