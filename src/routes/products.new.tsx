import { createFileRoute } from "@tanstack/react-router";
import { ProductForm } from "@/components/products/ProductForm";

export const Route = createFileRoute("/products/new")({
  head: () => ({ meta: [{ title: "New product — Northwind Admin" }] }),
  component: NewProductPage,
});

function NewProductPage() {
  return <ProductForm isEdit={false} />;
}
