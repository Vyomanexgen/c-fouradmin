import { createFileRoute } from "@tanstack/react-router";
import { Star, Check, X, MessageSquare, Loader2 } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReviews, moderateReview, Review } from "@/api/reviewApi";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { format } from "date-fns";

export const Route = createFileRoute("/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Northwind Admin" }] }),
  component: ReviewsPage,
});

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < n ? "fill-[color:var(--warning)] text-[color:var(--warning)]" : "text-muted-foreground/40"}`} />
      ))}
    </div>
  );
}

function ReviewCard({ 
  r, 
  onModerate,
  onReply
}: { 
  r: Review, 
  onModerate: (id: string, status: "approved" | "rejected") => void,
  onReply: (r: Review) => void
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{r.productName || "Product Review"}</p>
          <p className="text-xs text-muted-foreground">{r.customerName} · {r.date ? format(new Date(r.date), 'PP') : "—"}</p>
        </div>
        <StatusBadge status={r.status} />
      </div>
      <Stars n={r.rating} />
      <p className="mt-2 text-sm text-foreground">{r.comment}</p>
      
      {r.adminReply && (
        <div className="mt-3 bg-secondary/50 rounded p-3 border-l-2 border-primary text-sm">
          <p className="font-medium text-xs text-muted-foreground mb-1">Your reply:</p>
          <p>{r.adminReply}</p>
        </div>
      )}
      
      <div className="mt-3 flex flex-wrap gap-1.5">
        {r.status !== "approved" && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onModerate(r.id, "approved")}>
            <Check className="h-3.5 w-3.5" />Approve
          </Button>
        )}
        {r.status !== "rejected" && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onModerate(r.id, "rejected")}>
            <X className="h-3.5 w-3.5" />Reject
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={() => onReply(r)}>
          <MessageSquare className="h-3.5 w-3.5" />Reply
        </Button>
      </div>
    </div>
  );
}

function ReviewsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("pending");
  
  const [replyReview, setReplyReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["reviews", activeTab],
    queryFn: () => getReviews({ status: activeTab }),
  });

  const reviews: Review[] = Array.isArray(reviewsData?.reviews) ? reviewsData.reviews : Array.isArray(reviewsData?.data) ? reviewsData.data : Array.isArray(reviewsData) ? reviewsData : [];

  const moderateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: { status?: "approved" | "rejected"; adminReply?: string } }) => moderateReview(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      if (replyReview) {
        toast.success("Reply saved successfully");
        setReplyReview(null);
        setReplyText("");
      } else {
        toast.success("Review status updated");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update review");
    }
  });

  const handleModerate = (id: string, status: "approved" | "rejected") => {
    moderateMutation.mutate({ id, payload: { status } });
  };

  const submitReply = () => {
    if (!replyReview || !replyText.trim()) return;
    moderateMutation.mutate({ id: replyReview.id, payload: { adminReply: replyText } });
  };

  const by = (s: string) => reviews.filter((r) => r.status === s);

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Reviews" description="Moderate customer feedback across your catalog" />
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <SectionCard title={`${activeTab[0].toUpperCase()}${activeTab.slice(1)} reviews`}>
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : reviews.length === 0 ? (
              <EmptyState 
                title="No Reviews Found"
                description={`There are no ${activeTab} reviews right now.`}
              />
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {reviews.map((r) => (
                  <ReviewCard 
                    key={r.id} 
                    r={r} 
                    onModerate={handleModerate}
                    onReply={(rev) => {
                      setReplyReview(rev);
                      setReplyText(rev.adminReply || "");
                    }} 
                  />
                ))}
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
      
      <Dialog open={!!replyReview} onOpenChange={(open) => !open && setReplyReview(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Review</DialogTitle>
            <DialogDescription>
              Your reply will be visible publicly on the storefront under the customer's review.
            </DialogDescription>
          </DialogHeader>
          <Textarea 
            placeholder="Write your reply here..." 
            rows={5}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReplyReview(null)}>Cancel</Button>
            <Button 
              onClick={submitReply} 
              disabled={moderateMutation.isPending || !replyText.trim()}
            >
              {moderateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
