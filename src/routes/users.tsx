import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Plus, Check, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, deleteRole } from "@/api/rolesApi";
import { useToast } from "@/context/ToastContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/users")({
  head: () => ({ meta: [{ title: "Admin users & roles — Northwind Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      toast.success("Role deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete role.");
    },
  });

  const roles = rolesData || [];

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader 
        title="Admin users & roles" 
        description="Manage your team and what they can access"
      />

      <Tabs defaultValue="roles">
        <TabsList className="mb-4">
          <TabsTrigger value="roles">Roles & permissions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <SectionCard 
            title="Role permissions" 
            description="Configure what each role can do"
            action={
              <Link to="/roles/new">
                <Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Create Role</Button>
              </Link>
            }
          >
            {rolesLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Role Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.length === 0 ? (
                       <TableRow>
                         <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                           No roles configured.
                         </TableCell>
                       </TableRow>
                    ) : roles.map((r: any) => (
                      <TableRow key={r._id}>
                        <TableCell className="font-medium capitalize">{r.name.replace("_", " ")}</TableCell>
                        <TableCell className="text-muted-foreground max-w-sm truncate">{r.description || "—"}</TableCell>
                        <TableCell>
                          {r.isSystem ? (
                            <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">System</span>
                          ) : (
                            <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs">Custom</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link to={`/roles/${r._id}`} className="cursor-pointer">
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit Role
                                </Link>
                              </DropdownMenuItem>
                              {!r.isSystem && (
                                <>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive cursor-pointer">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this role?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will permanently delete the role "{r.name}". 
                                          Any users assigned to this role will lose these permissions immediately.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          className="bg-destructive hover:bg-destructive/90"
                                          onClick={() => deleteMutation.mutate(r._id)}
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="users">
          <SectionCard title="Team members">
            <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-lg">
               <h3 className="text-lg font-semibold mb-2">Users Management Deferred</h3>
               <p className="text-muted-foreground max-w-md">
                 The Admin Users API is not yet available in the backend documentation. This section will be implemented in Phase 10B once the GET /users API is provided.
               </p>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
