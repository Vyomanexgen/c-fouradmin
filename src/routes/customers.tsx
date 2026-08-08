import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExportMenu } from "@/components/export-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCustomers, updateCustomerStatus, Customer } from "@/api/customerApi";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Northwind Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  
  const [status, setStatus] = useState("any");
  const [sortBy, setSortBy] = useState("createdAt");

  const { mutate: toggleStatus, isPending: isToggling } = useMutation({
    mutationFn: (args: { id: string, currentStatus: string }) => {
      const newStatus = args.currentStatus === "blocked" ? "active" : "blocked";
      return updateCustomerStatus(args.id, newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["customers", debouncedSearch, status, sortBy],
    queryFn: () => {
      let params: any = {
        q: debouncedSearch || undefined,
        status: status === "any" ? undefined : status,
      };
      
      if (sortBy === "totalSpent") {
        params.sortBy = "totalSpent";
        params.sortOrder = "desc";
      } else if (sortBy === "ordersCount") {
        params.sortBy = "ordersCount";
        params.sortOrder = "desc";
      } else if (sortBy === "oldest") {
        params.sortBy = "createdAt";
        params.sortOrder = "asc";
      } else {
        params.sortBy = "createdAt";
        params.sortOrder = "desc";
      }
      
      return getCustomers(params);
    },
  });

  const customers: Customer[] = Array.isArray(customersData?.customers) ? customersData.customers : Array.isArray(customersData?.data) ? customersData.data : Array.isArray(customersData) ? customersData : [];
  const totalCustomers = customersData?.pagination?.totalItems || customersData?.total || customers.length || 0;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader 
        title="Customers" 
        description={`${totalCustomers} total customers`}
        actions={
          <>
            {customers.length > 0 && (
              <ExportMenu
                rows={customers.map(c => ({
                  id: c.id,
                  name: c.name,
                  email: c.email,
                  orders: c.ordersCount,
                  spent: c.totalSpent,
                  status: c.status,
                  joined: c.createdAt ? format(new Date(c.createdAt), 'PP') : "—"
                }))}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "name", label: "Name" },
                  { key: "email", label: "Email" },
                  { key: "orders", label: "Orders" },
                  { key: "spent", label: "Total spent", format: (r) => `$${r.spent}` },
                  { key: "status", label: "Status" },
                  { key: "joined", label: "Joined" },
                ]}
                filename="customers"
                title="Customers"
              />
            )}
          </>
        } 
      />

      <SectionCard title="All customers" className="mt-6">
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search customers…"
              className="h-9 pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="totalSpent">Highest Spend</SelectItem>
              <SelectItem value="ordersCount">Most Orders</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState 
            title="No Customers Found"
            description="Try adjusting your filters or search."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Total spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => {
                  const fullName = c.firstName || c.lastName ? `${c.firstName || ''} ${c.lastName || ''}`.trim() : c.name || "Unknown User";
                  const cStatus = c.status || (c.isBlocked ? "blocked" : c.isActive === false ? "blocked" : c.isActive === true ? "active" : "unknown");
                  
                  return (
                  <TableRow key={c.id || c._id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground uppercase">
                          {fullName.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{fullName}</p>
                          <p className="text-xs text-muted-foreground">{c.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={cStatus} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.createdAt ? format(new Date(c.createdAt), 'PP') : "—"}
                    </TableCell>
                    <TableCell className="text-right">{c.ordersCount || 0}</TableCell>
                    <TableCell className="text-right font-medium">${(c.totalSpent || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {cStatus === "blocked" ? (
                          <button 
                            onClick={() => toggleStatus({ id: c.id || c._id!, currentStatus: cStatus })}
                            disabled={isToggling}
                            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-2 disabled:opacity-50">
                            Unblock
                          </button>
                        ) : (
                          <button 
                            onClick={() => toggleStatus({ id: c.id || c._id!, currentStatus: cStatus })}
                            disabled={isToggling}
                            className="text-xs font-medium text-destructive hover:text-destructive/80 underline underline-offset-2 disabled:opacity-50">
                            Block
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
