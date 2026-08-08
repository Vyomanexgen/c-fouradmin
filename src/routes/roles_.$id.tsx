import { createFileRoute, useParams } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { RoleForm } from "@/components/users/RoleForm";
import { ChevronLeft, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRoles } from "@/api/rolesApi";

export const Route = createFileRoute("/roles_/$id")({
  head: () => ({ meta: [{ title: "Edit Role — Admin Console" }] }),
  component: EditRolePage,
});

function EditRolePage() {
  const { id } = useParams({ from: "/roles_/$id" });

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Loading role details...</p>
      </div>
    );
  }

  // Assuming getRoles returns an array of roles, we find the matching one.
  // In a real app, there might be a getRoleById endpoint.
  const roles = Array.isArray(rolesData) ? rolesData : [];
  const initialData = roles.find((r: any) => r._id === id);

  if (!initialData) {
    return (
      <div className="mx-auto max-w-[1200px] py-12 text-center">
        <h2 className="text-2xl font-semibold mb-2">Role not found</h2>
        <p className="text-muted-foreground mb-6">The role you're trying to edit does not exist or has been deleted.</p>
        <Link to="/users" className="text-primary hover:underline">
          Return to Users & Roles
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-4">
        <Link to="/users" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Users & Roles
        </Link>
      </div>
      <PageHeader 
        title={`Edit Role: ${initialData.name}`} 
        description={initialData.isSystem ? "System roles cannot be renamed or deleted, but permissions can be adjusted." : "Modify permissions and capabilities for this role."} 
      />
      
      <div className="mt-6">
        <RoleForm initialData={initialData} isEdit={true} />
      </div>
    </div>
  );
}
