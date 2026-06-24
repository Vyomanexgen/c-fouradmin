import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Upload } from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/products/new")({
  head: () => ({ meta: [{ title: "New product — Northwind Admin" }] }),
  component: NewProductPage,
});

function NewProductPage() {
  return (
    <div className="mx-auto max-w-[1200px]">
      <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2">
        <Link to="/products"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to products</Link>
      </Button>
      <PageHeader
        title="Add a new product"
        description="Create a product listing with pricing, inventory, and SEO metadata."
        actions={<><Button variant="outline" size="sm">Save draft</Button><Button size="sm">Publish</Button></>}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <SectionCard title="Product details">
            <div className="grid gap-4">
              <div className="grid gap-1.5"><Label>Product name</Label><Input placeholder="e.g. Aurora Wireless Headphones" /></div>
              <div className="grid gap-1.5"><Label>Description</Label><Textarea rows={5} placeholder="Describe the product, its benefits, and use cases…" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5"><Label>Brand</Label><Input placeholder="Northwind" /></div>
                <div className="grid gap-1.5"><Label>SKU</Label><Input placeholder="SKU-00000" /></div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Media">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/40 text-center text-xs text-muted-foreground">
                  <Upload className="mb-1 h-5 w-5" />
                  Upload
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Pricing">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5"><Label>Price</Label><Input type="number" placeholder="0.00" /></div>
              <div className="grid gap-1.5"><Label>Sale price</Label><Input type="number" placeholder="0.00" /></div>
              <div className="grid gap-1.5"><Label>Cost per item</Label><Input type="number" placeholder="0.00" /></div>
              <div className="grid gap-1.5"><Label>Tax class</Label>
                <Select><SelectTrigger><SelectValue placeholder="Standard" /></SelectTrigger>
                  <SelectContent><SelectItem value="standard">Standard</SelectItem><SelectItem value="reduced">Reduced</SelectItem><SelectItem value="zero">Zero</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Inventory">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5"><Label>Stock quantity</Label><Input type="number" placeholder="0" /></div>
              <div className="grid gap-1.5"><Label>Reorder level</Label><Input type="number" placeholder="10" /></div>
              <div className="grid gap-1.5"><Label>Barcode</Label><Input placeholder="123456789012" /></div>
              <div className="flex items-end justify-between rounded-lg border border-border p-3"><Label className="font-normal">Track inventory</Label><Switch defaultChecked /></div>
            </div>
          </SectionCard>

          <SectionCard title="SEO metadata">
            <div className="grid gap-4">
              <div className="grid gap-1.5"><Label>Page title</Label><Input placeholder="Auto-generated from product name" /></div>
              <div className="grid gap-1.5"><Label>Meta description</Label><Textarea rows={3} /></div>
              <div className="grid gap-1.5"><Label>URL handle</Label><Input placeholder="/products/aurora-wireless-headphones" /></div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Status">
            <Select defaultValue="active"><SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </SectionCard>

          <SectionCard title="Organization">
            <div className="grid gap-4">
              <div className="grid gap-1.5"><Label>Category</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent><SelectItem value="electronics">Electronics</SelectItem><SelectItem value="fashion">Fashion</SelectItem><SelectItem value="home">Home</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Subcategory</Label>
                <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent><SelectItem value="audio">Audio</SelectItem><SelectItem value="wearables">Wearables</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Tags</Label><Input placeholder="wireless, premium" /></div>
            </div>
          </SectionCard>

          <SectionCard title="Variants">
            <p className="mb-3 text-xs text-muted-foreground">Offer this product in multiple options like size or color.</p>
            <Button variant="outline" size="sm" className="w-full">+ Add variant</Button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
