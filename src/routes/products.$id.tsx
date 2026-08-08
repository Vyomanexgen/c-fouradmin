import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/products/ProductForm";
import { useQuery } from "@tanstack/react-query";
import { getProductById } from "@/api/productApi";
import { Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui-kit";

export const Route = createFileRoute("/products/$id")({
  head: () => ({ meta: [{ title: "Edit product — Northwind Admin" }] }),
  component: EditProductPage,
});

function EditProductPage() {
  const { id } = Route.useParams();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="mx-auto max-w-[1200px]">
        <EmptyState 
          title="Product Not Found"
          description="The product you are trying to edit does not exist or has been deleted."
        />
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}
