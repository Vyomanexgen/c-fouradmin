import { createFileRoute } from "@tanstack/react-router";
import { Star, Check, X, MessageSquare, Flag } from "lucide-react";
import { reviews } from "@/lib/mock-data";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Northwind Admin" }] }),
  component: ReviewsPage,
});

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-[color:var(--warning)] text-[color:var(--warning)]" : "text-muted-foreground/40"}`} />
      ))}
    </div>
  );
}

function ReviewCard({ r }: { r: typeof reviews[number] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{r.product}</p>
          <p className="text-xs text-muted-foreground">{r.author} · {r.date}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <Stars n={r.rating} />
      <p className="mt-2 text-sm text-foreground">{r.text}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Button variant="outline" size="sm" className="h-8 gap-1.5"><Check className="h-3.5 w-3.5" />Approve</Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5"><X className="h-3.5 w-3.5" />Reject</Button>
        <Button variant="outline" size="sm" className="h-8 gap-1.5"><MessageSquare className="h-3.5 w-3.5" />Reply</Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground"><Flag className="h-3.5 w-3.5" />Report</Button>
      </div>
    </div>
  );
}

function ReviewsPage() {
  const by = (s: string) => reviews.filter((r) => r.status === s);
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Reviews" description="Moderate customer feedback across your catalog" />
      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending ({by("pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({by("approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({by("rejected").length})</TabsTrigger>
        </TabsList>
        {(["pending", "approved", "rejected"] as const).map((tab) => (
          <TabsContent key={tab} value={tab}>
            <SectionCard title={`${tab[0].toUpperCase()}${tab.slice(1)} reviews`}>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {by(tab).map((r) => <ReviewCard key={r.id} r={r} />)}
              </div>
            </SectionCard>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
