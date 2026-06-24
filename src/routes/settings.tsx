import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Northwind Admin" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Settings" description="Configure your store, payments, and notifications" />

      <Tabs defaultValue="general" orientation="vertical" className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
        <TabsList className="h-auto flex-col items-stretch bg-transparent p-0">
          {[
            ["general", "General"],
            ["store", "Store info"],
            ["tax", "Tax"],
            ["shipping", "Shipping"],
            ["payment", "Payment gateways"],
            ["email", "Email"],
            ["notifications", "Notifications"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="justify-start data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        <div>
          <TabsContent value="general" className="mt-0">
            <SectionCard title="General">
              <div className="grid gap-4">
                <div className="grid gap-1.5"><Label>Default language</Label>
                  <Select defaultValue="en"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="es">Español</SelectItem><SelectItem value="fr">Français</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Default currency</Label>
                  <Select defaultValue="usd"><SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="usd">USD</SelectItem><SelectItem value="eur">EUR</SelectItem><SelectItem value="gbp">GBP</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3"><Label className="font-normal">Multi-store mode</Label><Switch /></div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="store" className="mt-0">
            <SectionCard title="Store information">
              <div className="grid gap-4">
                <div className="grid gap-1.5"><Label>Store name</Label><Input defaultValue="Northwind" /></div>
                <div className="grid gap-1.5"><Label>Store description</Label><Textarea rows={3} defaultValue="Premium products for modern living." /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5"><Label>Email</Label><Input defaultValue="hello@northwind.io" /></div>
                  <div className="grid gap-1.5"><Label>Phone</Label><Input defaultValue="+1 (555) 010-0100" /></div>
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="tax" className="mt-0">
            <SectionCard title="Tax">
              <div className="grid gap-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-3"><Label className="font-normal">Charge tax at checkout</Label><Switch defaultChecked /></div>
                <div className="grid gap-1.5"><Label>Default tax rate</Label><Input defaultValue="8.5%" /></div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="shipping" className="mt-0">
            <SectionCard title="Shipping zones">
              <div className="divide-y divide-border">
                {["Domestic — United States", "Canada & Mexico", "Europe", "Rest of world"].map((z) => (
                  <div key={z} className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium">{z}</span>
                    <Button variant="ghost" size="sm">Configure</Button>
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="payment" className="mt-0">
            <SectionCard title="Payment gateways">
              <div className="grid gap-3">
                {[["Stripe", true], ["PayPal", true], ["Apple Pay", true], ["Klarna", false], ["Cash on delivery", false]].map(([n, on]) => (
                  <div key={n as string} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">{n}</span>
                    <Switch defaultChecked={Boolean(on)} />
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="email" className="mt-0">
            <SectionCard title="Transactional email">
              <div className="grid gap-4">
                <div className="grid gap-1.5"><Label>From name</Label><Input defaultValue="Northwind" /></div>
                <div className="grid gap-1.5"><Label>Reply-to address</Label><Input defaultValue="support@northwind.io" /></div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="notifications" className="mt-0">
            <SectionCard title="Notification preferences">
              <div className="grid gap-3">
                {["New order", "Order shipped", "Order cancelled", "Low inventory", "Daily summary"].map((n) => (
                  <div key={n} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm font-medium">{n}</span>
                    <Switch defaultChecked />
                  </div>
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm">Cancel</Button>
            <Button size="sm">Save changes</Button>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
