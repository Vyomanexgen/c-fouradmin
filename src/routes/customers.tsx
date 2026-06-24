import { createFileRoute } from "@tanstack/react-router";
import { Search, Download, UserPlus } from "lucide-react";
import { customers } from "@/lib/mock-data";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — Northwind Admin" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Customers" description={`${customers.length} customers`}
        actions={
          <>
            <Button variant="outline" size="sm" className="h-9"><Download className="mr-1.5 h-4 w-4" />Export</Button>
            <Button size="sm" className="h-9"><UserPlus className="mr-1.5 h-4 w-4" />Add customer</Button>
          </>
        } />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total", value: customers.length },
          { label: "VIP", value: customers.filter((c) => c.segment === "VIP").length },
          { label: "New this month", value: customers.filter((c) => c.segment === "New").length },
          { label: "Churned", value: customers.filter((c) => c.segment === "Churned").length },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <SectionCard title="All customers" className="mt-6">
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search customers…" className="h-9 pl-8" />
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Segment</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Total spent</TableHead>
                <TableHead>Last active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                        {c.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={c.segment} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.joined}</TableCell>
                  <TableCell className="text-right">{c.orders}</TableCell>
                  <TableCell className="text-right font-medium">${c.spent.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.lastActive}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </div>
  );
}
