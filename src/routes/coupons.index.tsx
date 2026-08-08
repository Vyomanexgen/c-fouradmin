import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Ticket, Zap, Image as ImageIcon, Loader2 } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { getCoupons, Coupon } from "@/api/couponApi";
import { format } from "date-fns";

export const Route = createFileRoute("/coupons/")({
  head: () => ({ meta: [{ title: "Coupons & Promotions — Northwind Admin" }] }),
  component: CouponsPage,
});

function CouponsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coupons"],
    queryFn: () => getCoupons(),
  });

  const coupons: Coupon[] = Array.isArray(data?.coupons) ? data.coupons : Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader 
        title="Coupons & promotions" 
        description="Create discount rules, flash sales, and promotional banners"
        actions={
          <Button size="sm" asChild>
            <Link to="/coupons/new">
              <Plus className="mr-1.5 h-4 w-4" />New coupon
            </Link>
          </Button>
        } 
      />

      <Tabs defaultValue="coupons">
        <TabsList className="mb-4">
          <TabsTrigger value="coupons"><Ticket className="mr-1.5 h-4 w-4" />Coupons</TabsTrigger>
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
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  )}
                  {isError && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-destructive">
                        Failed to load coupons.
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !isError && coupons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <EmptyState 
                          title="No Coupons Found" 
                          description="Create a new discount code to offer your customers promotions." 
                        />
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && !isError && coupons.map((c) => {
                    const isActive = c.isActive !== false;
                    const isExpired = c.endDate ? new Date(c.endDate) < new Date() : false;
                    const limitReached = c.usageLimit && c.usageCount ? c.usageCount >= c.usageLimit : false;
                    const status = !isActive ? "disabled" : isExpired ? "expired" : limitReached ? "depleted" : "active";

                    return (
                      <TableRow key={c._id || c.id || c.code} className="hover:bg-muted/40">
                        <TableCell>
                          <span className="rounded-md bg-secondary px-2 py-1 font-mono text-xs font-medium uppercase">
                            {c.code}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm capitalize">{c.discountType}</TableCell>
                        <TableCell className="font-medium">
                          {c.discountType === "percentage" ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {c.usageLimit ? (
                                <Progress value={((c.usageCount || 0) / c.usageLimit) * 100} className="h-2 w-24" />
                              ) : (
                                <div className="h-2 w-24 bg-secondary rounded-full" />
                              )}
                              <span className="text-xs text-muted-foreground">
                                {c.usageCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : "used"}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {c.endDate ? format(new Date(c.endDate), "PP") : "Never"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
