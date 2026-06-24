import { createFileRoute } from "@tanstack/react-router";
import { Plus, Ticket, Zap, Image as ImageIcon } from "lucide-react";
import { coupons } from "@/lib/mock-data";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/coupons")({
  head: () => ({ meta: [{ title: "Coupons & Promotions — Northwind Admin" }] }),
  component: CouponsPage,
});

function CouponsPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Coupons & promotions" description="Create discount rules, flash sales, and promotional banners"
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />New coupon</Button>} />

      <Tabs defaultValue="coupons">
        <TabsList className="mb-4">
          <TabsTrigger value="coupons"><Ticket className="mr-1.5 h-4 w-4" />Coupons</TabsTrigger>
          <TabsTrigger value="flash"><Zap className="mr-1.5 h-4 w-4" />Flash sales</TabsTrigger>
          <TabsTrigger value="banners"><ImageIcon className="mr-1.5 h-4 w-4" />Banners</TabsTrigger>
        </TabsList>
        <TabsContent value="coupons">
          <SectionCard title="Active coupons">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((c) => (
                    <TableRow key={c.code} className="hover:bg-muted/40">
                      <TableCell><span className="rounded-md bg-secondary px-2 py-1 font-mono text-xs font-medium">{c.code}</span></TableCell>
                      <TableCell className="text-sm">{c.type}</TableCell>
                      <TableCell className="font-medium">{c.value}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={(c.uses / c.limit) * 100} className="h-2 w-24" />
                          <span className="text-xs text-muted-foreground">{c.uses.toLocaleString()} / {c.limit.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.expires}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>
        <TabsContent value="flash">
          <SectionCard title="Flash sales">
            <p className="text-sm text-muted-foreground">No flash sales scheduled. Create one to drive urgency.</p>
            <Button size="sm" className="mt-3">+ Schedule flash sale</Button>
          </SectionCard>
        </TabsContent>
        <TabsContent value="banners">
          <SectionCard title="Promotional banners">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {["Summer sale", "Free shipping week", "VIP early access"].map((t, i) => (
                <div key={t} className="overflow-hidden rounded-lg border border-border">
                  <div className="h-32 bg-gradient-to-br from-primary/30 via-primary/15 to-accent" />
                  <div className="p-3"><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">Live · {12 + i} days remaining</p></div>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
