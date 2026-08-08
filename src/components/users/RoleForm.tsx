import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SectionCard } from "@/components/ui-kit";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRole, updateRole, getSystemModules, Role } from "@/api/rolesApi";
import { useToast } from "@/context/ToastContext";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const permissionSchema = z.object({
  read: z.boolean().default(false),
  write: z.boolean().default(false),
  delete: z.boolean().default(false),
});

const roleSchema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional(),
  modulePermissions: z.record(z.string(), permissionSchema),
  featurePermissions: z.record(z.string(), permissionSchema),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  initialData?: Role;
  isEdit?: boolean;
}

export function RoleForm({ initialData, isEdit }: RoleFormProps) {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: modulesData, isLoading: isModulesLoading } = useQuery({
    queryKey: ["system-modules"],
    queryFn: getSystemModules,
  });

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
      modulePermissions: {},
      featurePermissions: {},
    },
  });

  useEffect(() => {
    if (initialData) {
      const formattedModules: Record<string, any> = {};
      const formattedFeatures: Record<string, any> = {};

      initialData.modulePermissions?.forEach(p => {
        if (p.module) formattedModules[p.module] = p;
      });

      initialData.featurePermissions?.forEach(p => {
        if (p.feature) formattedFeatures[p.feature] = p;
      });

      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        modulePermissions: formattedModules,
        featurePermissions: formattedFeatures,
      });
    }
  }, [initialData, form]);

  const mutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      // Transform records back to arrays
      const modulePermissions = Object.entries(values.modulePermissions).map(([module, perms]) => ({
        module,
        ...perms,
      }));
      const featurePermissions = Object.entries(values.featurePermissions).map(([feature, perms]) => ({
        feature,
        ...perms,
      }));

      const payload = {
        name: values.name,
        description: values.description,
        modulePermissions,
        featurePermissions,
      };

      if (isEdit && initialData?._id) {
        return updateRole(initialData._id, payload);
      }
      return createRole(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Role updated successfully" : "Role created successfully");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      navigate({ to: "/users" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save role");
    },
  });

  const onSubmit = (data: RoleFormValues) => {
    mutation.mutate(data);
  };

  if (isModulesLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading modules...</p>
      </div>
    );
  }

  const modules = modulesData || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-4xl pb-10">
        <SectionCard title="Role Details">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label>Role Name</Label>
                  <FormControl><Input placeholder="e.g. Store Manager" {...field} disabled={initialData?.isSystem} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <Label>Description</Label>
                  <FormControl><Textarea placeholder="What can this role do?" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </SectionCard>

        <SectionCard title="Module Permissions" description="Grant broad access to entire sections of the admin panel.">
          <div className="space-y-6">
            {modules.map(mod => (
              <div key={mod._id} className="rounded-lg border border-border p-4 bg-secondary/5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-semibold capitalize text-sm">{mod.name.replace("_", " ")}</h4>
                    <p className="text-xs text-muted-foreground">{mod.description}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    {["read", "write", "delete"].map((action) => (
                      <FormField
                        key={action}
                        control={form.control}
                        name={`modulePermissions.${mod.name}.${action}` as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <Label className="text-xs font-medium capitalize">{action}</Label>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                {mod.features && mod.features.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specific Features</h5>
                      <div className="grid gap-3 pl-2 border-l-2 border-border/50">
                        {mod.features.map(feat => (
                          <div key={feat.name} className="flex items-center justify-between">
                            <Label className="text-sm font-normal">{feat.description}</Label>
                            <div className="flex items-center gap-6">
                              {["read", "write", "delete"].map((action) => (
                                <FormField
                                  key={action}
                                  control={form.control}
                                  name={`featurePermissions.${feat.name}.${action}` as any}
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                      {/* Only show label on the first one for neatness, or keep them to align with modules above */}
                                      <Label className="text-xs font-medium capitalize opacity-0 w-8">{action}</Label>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/users" })}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
