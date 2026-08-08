import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Bell as BellIcon, Image as ImageIcon, Gift, Plus, Loader2, Trash2, Edit } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMarketingStats, getCampaigns, deleteCampaign } from "@/api/marketingApi";
import { useToast } from "@/context/ToastContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/marketing")({
  head: () => ({ meta: [{ title: "Marketing — Northwind Admin" }] }),
  component: MarketingPage,
});

function formatNumber(num: number | undefined): string {
  if (num === undefined) return "0";
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

function MarketingPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: stats, isLoading: isStatsLoading, isError: isStatsError } = useQuery({
    queryKey: ["marketingStats"],
    queryFn: getMarketingStats,
  });

  const { data: campaignsResponse, isLoading: isCampaignsLoading, isError: isCampaignsError } = useQuery({
    queryKey: ["marketing", "campaigns"],
    queryFn: () => getCampaigns(),
  });

  const campaigns = campaignsResponse?.data || [];

  const deleteMutation = useMutation({
    mutationFn: deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["marketingStats"] });
      toast.success("Campaign deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete campaign");
    }
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader 
        title="Marketing" 
        description="Email, push, and referral programs"
        actions={
          <Button size="sm" asChild>
            <Link to="/marketing/new"><Plus className="mr-1.5 h-4 w-4" />New campaign</Link>
          </Button>
        } 
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[
          { label: "Email", icon: Mail, value: formatNumber(stats?.emailSubscribersCount), sub: "subscribers" },
          { label: "Push", icon: BellIcon, value: formatNumber(stats?.pushDevicesCount), sub: "devices" },
          { label: "Banners", icon: ImageIcon, value: stats?.liveBannersCount?.toString() || "0", sub: "live" },
          { label: "Referrals", icon: Gift, value: stats?.monthlyReferralsCount?.toString() || "0", sub: "this month" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            {isStatsLoading ? (
              <div className="mt-2 h-8 w-20 animate-pulse rounded-md bg-muted" />
            ) : isStatsError ? (
              <p className="mt-2 text-2xl font-semibold text-destructive">Error</p>
            ) : (
              <p className="mt-2 text-2xl font-semibold">{s.value}</p>
            )}
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        ))}
      </div>

      <SectionCard title="Campaigns" description="All marketing campaigns across channels" className="mt-6">
        <div className="divide-y divide-border">
          {isCampaignsLoading && (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {isCampaignsError && (
            <div className="flex h-32 items-center justify-center text-destructive">
              Failed to load campaigns.
            </div>
          )}
          {!isCampaignsLoading && !isCampaignsError && campaigns.length === 0 && (
            <div className="py-8">
              <EmptyState 
                title="No campaigns found"
                description="You haven't created any marketing campaigns yet."
              />
            </div>
          )}
          {!isCampaignsLoading && !isCampaignsError && campaigns.map((c) => {
            const recipients = c.metrics?.recipientsCount || 0;
            const opened = c.metrics?.openedCount || 0;
            const clicked = c.metrics?.clickedCount || 0;
            const openRate = recipients > 0 ? ((opened / recipients) * 100).toFixed(1) + "%" : "0%";
            const clickRate = recipients > 0 ? ((clicked / recipients) * 100).toFixed(1) + "%" : "0%";

            return (
              <div key={c._id || c.id || c.name} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3 sm:grid-cols-[1fr_auto_auto_auto_auto_auto]">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.channel} · {recipients.toLocaleString()} recipients</p>
                </div>
                <span className="hidden text-xs text-muted-foreground sm:inline">Open <span className="font-medium text-foreground">{openRate}</span></span>
                <span className="hidden text-xs text-muted-foreground sm:inline">Click <span className="font-medium text-foreground">{clickRate}</span></span>
                <StatusBadge status={c.status} />
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/marketing/${c._id || c.id}`}>Edit</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete campaign "{c.name}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(c._id || c.id!)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
