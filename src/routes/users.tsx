import { createFileRoute } from "@tanstack/react-router";
import { adminUsers } from "@/lib/mock-data";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Plus, Check } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Admin users & roles — Northwind Admin" }] }),
  component: UsersPage,
});

const roles = ["Super Admin", "Admin", "Manager", "Inventory Manager", "Customer Support"];
const perms = ["View", "Create", "Edit", "Delete", "Export"];

const matrix: Record<string, Record<string, boolean>> = {
  "Super Admin": { View: true, Create: true, Edit: true, Delete: true, Export: true },
  "Admin": { View: true, Create: true, Edit: true, Delete: true, Export: true },
  "Manager": { View: true, Create: true, Edit: true, Delete: false, Export: true },
  "Inventory Manager": { View: true, Create: true, Edit: true, Delete: false, Export: false },
  "Customer Support": { View: true, Create: false, Edit: false, Delete: false, Export: false },
};

function UsersPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Admin users & roles" description="Manage your team and what they can access"
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Invite user</Button>} />

      <Tabs defaultValue="users">
        <TabsList className="mb-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <SectionCard title="Team members">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last login</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adminUsers.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                            {u.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{u.name}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{u.role}</span></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.lastLogin}</TableCell>
                      <TableCell><StatusBadge status={u.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="roles">
          <SectionCard title="Role permissions" description="Configure what each role can do">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role</TableHead>
                    {perms.map((p) => <TableHead key={p} className="text-center">{p}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((r) => (
                    <TableRow key={r}>
                      <TableCell className="font-medium">{r}</TableCell>
                      {perms.map((p) => (
                        <TableCell key={p} className="text-center">
                          {matrix[r][p] ? <Check className="mx-auto h-4 w-4 text-[color:var(--success)]" /> : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
