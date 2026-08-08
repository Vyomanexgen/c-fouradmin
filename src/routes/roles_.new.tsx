import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-kit";
import { RoleForm } from "@/components/users/RoleForm";
import { ChevronLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/roles_/new")({
  head: () => ({ meta: [{ title: "Create Role — Admin Console" }] }),
  component: NewRolePage,
});

function NewRolePage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="mb-4">
        <Link to="/users" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Users & Roles
        </Link>
      </div>
      <PageHeader title="Create new role" description="Define a new role and grant granular permissions to your team members." />
      
      <div className="mt-6">
        <RoleForm />
      </div>
    </div>
  );
}
