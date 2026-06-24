import { createFileRoute } from "@tanstack/react-router";
import { Plus, FileText, HelpCircle, Image as ImageIcon, ScrollText } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/content")({
  head: () => ({ meta: [{ title: "Content — Northwind Admin" }] }),
  component: ContentPage,
});

const banners = [
  { title: "Summer Drop 2026", placement: "Homepage hero", status: "active" },
  { title: "Free shipping over $50", placement: "Top bar", status: "active" },
  { title: "VIP early access", placement: "Category page", status: "scheduled" },
];

const pages = [
  { title: "About us", url: "/about", updated: "2026-06-12", status: "active" },
  { title: "Landing — Summer collection", url: "/summer-2026", updated: "2026-06-21", status: "active" },
  { title: "Holiday gift guide", url: "/holiday-guide", updated: "2026-05-30", status: "draft" },
];

const posts = [
  { title: "10 ways to style our summer collection", author: "Editorial", date: "2026-06-18", status: "active" },
  { title: "Behind the scenes: Aurora headphones", author: "Marketing", date: "2026-06-10", status: "active" },
  { title: "Sustainability report 2026", author: "Founders", date: "2026-05-22", status: "draft" },
];

const faqs = [
  { q: "How long does shipping take?", a: "Domestic orders arrive in 2–5 business days." },
  { q: "What is your return policy?", a: "Free returns within 30 days of delivery." },
  { q: "Do you ship internationally?", a: "Yes, we ship to 42 countries." },
];

const policies = ["Privacy policy", "Terms of service", "Refund policy", "Shipping policy", "Cookie policy"];

function ContentPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader title="Content" description="Banners, landing pages, blog, FAQs, and legal pages"
        actions={<Button size="sm"><Plus className="mr-1.5 h-4 w-4" />New content</Button>} />

      <Tabs defaultValue="banners">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="banners"><ImageIcon className="mr-1.5 h-4 w-4" />Banners</TabsTrigger>
          <TabsTrigger value="pages"><FileText className="mr-1.5 h-4 w-4" />Pages</TabsTrigger>
          <TabsTrigger value="blog"><ScrollText className="mr-1.5 h-4 w-4" />Blog</TabsTrigger>
          <TabsTrigger value="faq"><HelpCircle className="mr-1.5 h-4 w-4" />FAQ</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="banners">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {banners.map((b) => (
              <SectionCard key={b.title} title={b.title}>
                <div className="mb-3 h-32 rounded-md bg-gradient-to-br from-primary/30 to-accent" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{b.placement}</span>
                  <StatusBadge status={b.status} />
                </div>
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <SectionCard title="Landing pages">
            <div className="divide-y divide-border">
              {pages.map((p) => (
                <div key={p.url} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{p.url} · updated {p.updated}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="blog">
          <SectionCard title="Blog posts">
            <div className="divide-y divide-border">
              {posts.map((p) => (
                <div key={p.title} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                  <div>
                    <p className="text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.author} · {p.date}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="faq">
          <SectionCard title="Frequently asked questions">
            <div className="space-y-3">
              {faqs.map((f) => (
                <div key={f.q} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">{f.q}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="policies">
          <SectionCard title="Legal & policy pages">
            <div className="divide-y divide-border">
              {policies.map((p) => (
                <div key={p} className="flex items-center justify-between py-3">
                  <span className="text-sm font-medium">{p}</span>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
