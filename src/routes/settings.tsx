import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrganizationConfig, updateOrganizationConfig } from "@/api/configApi";
import { getPaymentGateways, updatePaymentGateway, PaymentGatewayResponse } from "@/api/paymentApi";
import { useToast } from "@/context/ToastContext";
import { Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Admin Console" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: configData, isLoading: isConfigLoading } = useQuery({
    queryKey: ["config"],
    queryFn: getOrganizationConfig,
  });

  const { data: paymentsData, isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: getPaymentGateways,
  });

  // State for config
  const [taxRate, setTaxRate] = useState<number>(18);
  const [shippingFee, setShippingFee] = useState<number>(50);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(500);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [handlingFee, setHandlingFee] = useState<number>(0);
  const [multiStoreMode, setMultiStoreMode] = useState<boolean>(false);
  const [storeInfo, setStoreInfo] = useState({
    name: "Northwind",
    description: "",
    contactEmail: "",
    contactPhone: "",
    defaultLanguage: "en",
    defaultCurrency: "usd",
  });
  const [emailConfig, setEmailConfig] = useState({
    fromName: "",
    replyToAddress: "",
  });
  const [notifications, setNotifications] = useState({
    orderPlaced: true,
    orderShipped: true,
    orderCancelled: true,
    lowInventory: false,
    dailySummary: false,
  });

  // State for payment gateways
  const [gateways, setGateways] = useState<Record<string, {
    isActive: boolean;
    keyId: string;
    secret: string;
    webhookSecret: string;
  }>>({
    stripe: { isActive: false, keyId: "", secret: "", webhookSecret: "" },
    razorpay: { isActive: false, keyId: "", secret: "", webhookSecret: "" },
    cashfree: { isActive: false, keyId: "", secret: "", webhookSecret: "" },
  });

  // Sync loaded configuration values
  useEffect(() => {
    if (configData) {
      const cfg = configData.data || configData;
      setTaxRate(cfg.taxRate ?? 18);
      setShippingFee(cfg.shippingFee ?? 50);
      setFreeShippingThreshold(cfg.freeShippingThreshold ?? 500);
      setPlatformFee(cfg.platformFee ?? 0);
      setHandlingFee(cfg.handlingFee ?? 0);
      setMultiStoreMode(cfg.multiStoreMode ?? false);
      
      if (cfg.storeInfo) {
        setStoreInfo({
          name: cfg.storeInfo.name || "Northwind",
          description: cfg.storeInfo.description || "",
          contactEmail: cfg.storeInfo.contactEmail || "",
          contactPhone: cfg.storeInfo.contactPhone || "",
          defaultLanguage: cfg.storeInfo.defaultLanguage || "en",
          defaultCurrency: cfg.storeInfo.defaultCurrency || "usd",
        });
      }
      
      if (cfg.email) {
        setEmailConfig({
          fromName: cfg.email.fromName || "",
          replyToAddress: cfg.email.replyToAddress || "",
        });
      }
      
      if (cfg.notifications) {
        setNotifications({
          orderPlaced: cfg.notifications.orderPlaced ?? true,
          orderShipped: cfg.notifications.orderShipped ?? true,
          orderCancelled: cfg.notifications.orderCancelled ?? true,
          lowInventory: false,
          dailySummary: false,
        });
      }
    }
  }, [configData]);

  // Sync loaded payment gateway values
  useEffect(() => {
    if (paymentsData) {
      const list: PaymentGatewayResponse[] = paymentsData.data || paymentsData;
      const initialGateways = {
        stripe: { isActive: false, keyId: "", secret: "", webhookSecret: "" },
        razorpay: { isActive: false, keyId: "", secret: "", webhookSecret: "" },
        cashfree: { isActive: false, keyId: "", secret: "", webhookSecret: "" },
      };
      
      list.forEach((g) => {
        if (initialGateways[g.provider]) {
          initialGateways[g.provider] = {
            isActive: g.isActive,
            keyId: g.keyId || "",
            secret: "", // Keep password secret field empty for security
            webhookSecret: g.webhookSecret || "",
          };
        }
      });
      setGateways(initialGateways);
    }
  }, [paymentsData]);

  const [isSaving, setIsSaving] = useState(false);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // 1. Update config parameters
      await updateOrganizationConfig({
        taxRate,
        shippingFee,
        freeShippingThreshold,
        platformFee,
        handlingFee,
        multiStoreMode,
        storeInfo,
        email: emailConfig,
        notifications: {
          orderPlaced: notifications.orderPlaced,
          orderPaid: notifications.orderPlaced, // simplified mapping
          orderShipped: notifications.orderShipped,
          orderCancelled: notifications.orderCancelled,
        }
      });

      // 2. Update payment configurations
      const providers: Array<"stripe" | "razorpay" | "cashfree"> = ["stripe", "razorpay", "cashfree"];
      for (const provider of providers) {
        const gw = gateways[provider];
        if (gw.isActive || gw.keyId || gw.secret) {
          if (gw.isActive && (!gw.keyId || !gw.secret)) {
            throw new Error(`Key ID and Secret Key are required for active provider: ${provider.toUpperCase()}`);
          }
          await updatePaymentGateway(provider, {
            isActive: gw.isActive,
            keyId: gw.keyId,
            secret: gw.secret,
            webhookSecret: gw.webhookSecret || undefined,
          });
        }
      }
    },
    onSuccess: () => {
      toast.success("Settings saved and updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["config"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      
      // Notify storefront tabs if any listening mechanisms exist
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("config-updated"));
      }
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
        err.message ||
        "Failed to update settings. Please verify details."
      );
    }
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveMutation.mutateAsync();
    } catch (e) {
      // Handled by onError
    } finally {
      setIsSaving(false);
    }
  };

  if (isConfigLoading || isPaymentsLoading) {
    return (
      <div className="mx-auto max-w-[1200px] py-12">
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">Loading store settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Settings" description="Configure your store, payments, taxes, and shipping parameters" />

      <form onSubmit={handleSave}>
        <Tabs defaultValue="general" orientation="vertical" className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
          <TabsList className="h-auto flex-col items-stretch bg-transparent p-0">
            {[
              ["general", "General"],
              ["store", "Store info"],
              ["tax", "Tax"],
              ["shipping", "Shipping"],
              ["fees", "Platform Fees"],
              ["payment", "Payment gateways"],
              ["email", "Email"],
              ["notifications", "Notifications"],
            ].map(([v, l]) => (
              <TabsTrigger key={v} value={v} className="justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                {l}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="space-y-6">
            <TabsContent value="general" className="mt-0">
              <SectionCard title="General">
                <div className="grid gap-4">
                  <div className="grid gap-1.5"><Label>Default language</Label>
                    <Select value={storeInfo.defaultLanguage} onValueChange={(v) => setStoreInfo(s => ({ ...s, defaultLanguage: v }))} disabled={isSaving}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem><SelectItem value="fr">Français</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5"><Label>Default currency</Label>
                    <Select value={storeInfo.defaultCurrency} onValueChange={(v) => setStoreInfo(s => ({ ...s, defaultCurrency: v }))} disabled={isSaving}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="usd">USD</SelectItem><SelectItem value="eur">EUR</SelectItem><SelectItem value="gbp">GBP</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3"><Label className="font-normal">Multi-store mode</Label><Switch checked={multiStoreMode} onCheckedChange={setMultiStoreMode} disabled={isSaving} /></div>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="store" className="mt-0">
              <SectionCard title="Store information">
                <div className="grid gap-4">
                  <div className="grid gap-1.5"><Label>Store name</Label><Input value={storeInfo.name} onChange={e => setStoreInfo(s => ({ ...s, name: e.target.value }))} disabled={isSaving} /></div>
                  <div className="grid gap-1.5"><Label>Store description</Label><Textarea rows={3} value={storeInfo.description} onChange={e => setStoreInfo(s => ({ ...s, description: e.target.value }))} disabled={isSaving} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5"><Label>Email</Label><Input value={storeInfo.contactEmail} onChange={e => setStoreInfo(s => ({ ...s, contactEmail: e.target.value }))} disabled={isSaving} /></div>
                    <div className="grid gap-1.5"><Label>Phone</Label><Input value={storeInfo.contactPhone} onChange={e => setStoreInfo(s => ({ ...s, contactPhone: e.target.value }))} disabled={isSaving} /></div>
                  </div>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="tax" className="mt-0">
              <SectionCard title="Tax" description="Configure GST tax rate applied at checkout">
                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      min={0}
                      max={100}
                      disabled={isSaving}
                      required
                    />
                  </div>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="shipping" className="mt-0">
              <SectionCard title="Shipping Configuration" description="Configure shipping fees and thresholds">
                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="shippingFee">Default Shipping Fee</Label>
                    <Input
                      id="shippingFee"
                      type="number"
                      value={shippingFee}
                      onChange={(e) => setShippingFee(Number(e.target.value))}
                      min={0}
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="freeShippingThreshold">Free Shipping Threshold</Label>
                    <Input
                      id="freeShippingThreshold"
                      type="number"
                      value={freeShippingThreshold}
                      onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                      min={0}
                      disabled={isSaving}
                      required
                    />
                  </div>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="fees" className="mt-0">
              <SectionCard title="Platform & Handling Fees" description="Configure platform-wide transaction and handling fees">
                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="platformFee">Platform Fee</Label>
                    <Input
                      id="platformFee"
                      type="number"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(Number(e.target.value))}
                      min={0}
                      disabled={isSaving}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="handlingFee">Handling Fee</Label>
                    <Input
                      id="handlingFee"
                      type="number"
                      value={handlingFee}
                      onChange={(e) => setHandlingFee(Number(e.target.value))}
                      min={0}
                      disabled={isSaving}
                      required
                    />
                  </div>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="payment" className="mt-0">
              <SectionCard title="Payment Gateways" description="Configure Active Gateways and Credentials">
                <div className="space-y-6">
                  {(["stripe", "razorpay", "cashfree"] as const).map((provider) => {
                    const gw = gateways[provider] || { isActive: false, keyId: "", secret: "", webhookSecret: "" };
                    return (
                      <div key={provider} className="rounded-xl border border-border p-4 space-y-4 bg-secondary/10">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm capitalize">{provider}</span>
                          <Switch
                            checked={gw.isActive}
                            disabled={isSaving}
                            onCheckedChange={(checked) => {
                              setGateways((prev) => ({
                                ...prev,
                                [provider]: { ...prev[provider], isActive: checked },
                              }));
                            }}
                          />
                        </div>
                        
                        {gw.isActive && (
                          <div className="grid gap-3 pt-2">
                            <div className="grid gap-1.5">
                              <Label htmlFor={`${provider}-keyId`}>Key ID / Public Key</Label>
                              <Input
                                id={`${provider}-keyId`}
                                type="text"
                                value={gw.keyId}
                                disabled={isSaving}
                                onChange={(e) => {
                                  setGateways((prev) => ({
                                    ...prev,
                                    [provider]: { ...prev[provider], keyId: e.target.value },
                                  }));
                                }}
                                placeholder={`Enter ${provider} Key ID`}
                                required
                              />
                            </div>
                            
                            <div className="grid gap-1.5">
                              <Label htmlFor={`${provider}-secret`}>Secret Key / Private Key</Label>
                              <Input
                                id={`${provider}-secret`}
                                type="password"
                                value={gw.secret}
                                disabled={isSaving}
                                onChange={(e) => {
                                  setGateways((prev) => ({
                                    ...prev,
                                    [provider]: { ...prev[provider], secret: e.target.value },
                                  }));
                                }}
                                placeholder="Enter secret token"
                                required
                              />
                            </div>

                            <div className="grid gap-1.5">
                              <Label htmlFor={`${provider}-webhook`}>Webhook Secret (Optional)</Label>
                              <Input
                                id={`${provider}-webhook`}
                                type="text"
                                value={gw.webhookSecret}
                                disabled={isSaving}
                                onChange={(e) => {
                                  setGateways((prev) => ({
                                    ...prev,
                                    [provider]: { ...prev[provider], webhookSecret: e.target.value },
                                  }));
                                }}
                                placeholder="Enter webhook secret token"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="email" className="mt-0">
              <SectionCard title="Transactional email">
                <div className="grid gap-4">
                  <div className="grid gap-1.5"><Label>From name</Label><Input value={emailConfig.fromName} onChange={e => setEmailConfig(c => ({ ...c, fromName: e.target.value }))} disabled={isSaving} /></div>
                  <div className="grid gap-1.5"><Label>Reply-to address</Label><Input value={emailConfig.replyToAddress} onChange={e => setEmailConfig(c => ({ ...c, replyToAddress: e.target.value }))} disabled={isSaving} /></div>
                </div>
              </SectionCard>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <SectionCard title="Notification preferences">
                <div className="grid gap-3">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">New order</span>
                    <Switch checked={notifications.orderPlaced} onCheckedChange={v => setNotifications(n => ({ ...n, orderPlaced: v }))} disabled={isSaving} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">Order shipped</span>
                    <Switch checked={notifications.orderShipped} onCheckedChange={v => setNotifications(n => ({ ...n, orderShipped: v }))} disabled={isSaving} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">Order cancelled</span>
                    <Switch checked={notifications.orderCancelled} onCheckedChange={v => setNotifications(n => ({ ...n, orderCancelled: v }))} disabled={isSaving} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">Low inventory</span>
                    <Switch checked={notifications.lowInventory} onCheckedChange={v => setNotifications(n => ({ ...n, lowInventory: v }))} disabled={isSaving} />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">Daily summary</span>
                    <Switch checked={notifications.dailySummary} onCheckedChange={v => setNotifications(n => ({ ...n, dailySummary: v }))} disabled={isSaving} />
                  </div>
                </div>
              </SectionCard>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit" size="sm" className="h-9 gap-1.5" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </Tabs>
      </form>
    </div>
  );
}
