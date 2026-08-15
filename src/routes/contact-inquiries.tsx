import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-kit";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContactSubmissions, updateSubmissionStatus, queryKeys, ContactSubmission } from "@/api/storefrontApi";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/contact-inquiries")({
  head: () => ({ meta: [{ title: "Contact Inquiries — Admin Console" }] }),
  component: ContactInquiriesPage,
});

function ContactInquiriesPage() {
  const queryClient = useQueryClient();
  
  const [status, setStatus] = useState("any");
  const [page, setPage] = useState(1);
  const limit = 20;

  const filters = { status, page, limit, sort: "-createdAt" };

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.contactInquiries(filters),
    queryFn: () => getContactSubmissions(filters),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateSubmissionStatus,
    onMutate: async ({ id, status: newStatus }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.contactInquiries(filters) });
      const previousData = queryClient.getQueryData(queryKeys.contactInquiries(filters));
      
      queryClient.setQueryData(queryKeys.contactInquiries(filters), (old: any) => {
        if (!old?.data?.submissions) return old;
        return {
          ...old,
          data: {
            ...old.data,
            submissions: old.data.submissions.map((sub: ContactSubmission) => 
              (sub._id || sub.id) === id ? { ...sub, status: newStatus } : sub
            )
          }
        };
      });

      return { previousData };
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(queryKeys.contactInquiries(filters), context?.previousData);
      toast.error("Failed to update status.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-inquiries"] });
    },
    onSuccess: () => {
      toast.success("Contact inquiry status updated.");
    },
  });

  const submissions = data?.data?.submissions || [];
  const pagination = data?.data?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <PageHeader 
        title="Contact Inquiries" 
        description="Manage customer questions and support requests submitted from the storefront." 
      />

      <SectionCard className="p-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <EmptyState 
            title="Failed to load inquiries" 
            description="There was an error loading the data from the server."
            action={<Button variant="outline" onClick={() => refetch()}>Retry</Button>}
          />
        ) : submissions.length === 0 ? (
          <EmptyState 
            title="No inquiries found" 
            description="There are no contact inquiries matching your current filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub: ContactSubmission, idx: number) => (
                  <TableRow key={`${sub._id || sub.id || 'contact-inquiry'}-${idx}`}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(sub.createdAt), "MMM d, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-xs text-muted-foreground">{sub.email}</div>
                      {sub.phone && <div className="text-xs text-muted-foreground">{sub.phone}</div>}
                    </TableCell>
                    <TableCell className="font-medium">{sub.subject || "No Subject"}</TableCell>
                    <TableCell className="max-w-xs truncate" title={sub.message}>
                      {sub.message}
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={sub.status} 
                        onValueChange={(val: any) => updateStatusMutation.mutate({ id: sub._id || sub.id || "", status: val })}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue>
                            <StatusBadge 
                              status={sub.status} 
                              variant={
                                sub.status === "pending" ? "warning" : 
                                sub.status === "replied" ? "success" : "default"
                              } 
                            />
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="read">Read</SelectItem>
                          <SelectItem value="replied">Replied</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {/* Pagination logic if needed */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border p-4">
            <div className="text-sm text-muted-foreground">
              Showing page {pagination.page} of {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
