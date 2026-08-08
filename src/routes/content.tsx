import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, FileText, HelpCircle, Image as ImageIcon, ScrollText, Loader2, Trash2, Edit } from "lucide-react";
import { PageHeader, SectionCard, StatusBadge, EmptyState } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContentItems, ContentItem, deleteContentItem } from "@/api/contentApi";
import { getBanners, Banner, deleteBanner } from "@/api/marketingApi";
import { useToast } from "@/context/ToastContext";
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

export const Route = createFileRoute("/content")({
  head: () => ({ meta: [{ title: "Content — Northwind Admin" }] }),
  component: ContentPage,
});

function ContentList({ 
  items, 
  isLoading, 
  isError, 
  renderItem, 
  emptyTitle 
}: { 
  items: any[]; 
  isLoading: boolean; 
  isError: boolean; 
  renderItem: (item: any) => React.ReactNode;
  emptyTitle: string;
}) {
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex h-32 items-center justify-center text-destructive">
        Failed to load content.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="py-8">
        <EmptyState title={emptyTitle} description="No content items found." />
      </div>
    );
  }

  return <>{items.map(renderItem)}</>;
}

function ContentPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: bannersResponse, isLoading: isBannersLoading, isError: isBannersError } = useQuery({
    queryKey: ["banners"],
    queryFn: () => getBanners(),
  });

  const { data: pagesResponse, isLoading: isPagesLoading, isError: isPagesError } = useQuery({
    queryKey: ["content", "page"],
    queryFn: () => getContentItems({ type: "page" }),
  });

  const { data: blogResponse, isLoading: isBlogLoading, isError: isBlogError } = useQuery({
    queryKey: ["content", "blog"],
    queryFn: () => getContentItems({ type: "blog" }),
  });

  const { data: faqResponse, isLoading: isFaqLoading, isError: isFaqError } = useQuery({
    queryKey: ["content", "faq"],
    queryFn: () => getContentItems({ type: "faq" }),
  });

  const { data: policyResponse, isLoading: isPolicyLoading, isError: isPolicyError } = useQuery({
    queryKey: ["content", "policy"],
    queryFn: () => getContentItems({ type: "policy" }),
  });

  const banners = bannersResponse?.data || [];
  const pages = pagesResponse?.data || [];
  const blogs = blogResponse?.data || [];
  const faqs = faqResponse?.data || [];
  const policies = policyResponse?.data || [];

  const deleteBannerMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      toast.success("Banner deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete banner");
    }
  });

  const deleteContentMutation = useMutation({
    mutationFn: deleteContentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast.success("Content deleted successfully");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to delete content");
    }
  });

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageHeader 
        title="Content" 
        description="Banners, landing pages, blog, FAQs, and legal pages"
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to="/banners/new"><ImageIcon className="mr-1.5 h-4 w-4" />New banner</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/content/new"><Plus className="mr-1.5 h-4 w-4" />New content</Link>
            </Button>
          </div>
        } 
      />

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
            <ContentList
              items={banners}
              isLoading={isBannersLoading}
              isError={isBannersError}
              emptyTitle="No banners found"
              renderItem={(b: Banner) => (
                <SectionCard key={b._id || b.id || b.title} title={b.title}>
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.title} className="mb-3 h-32 w-full rounded-md object-cover" />
                  ) : (
                    <div className="mb-3 h-32 rounded-md bg-gradient-to-br from-primary/30 to-accent" />
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{b.placement || "Uncategorized"}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={b.status || "draft"} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                        <Link to={`/banners/${b._id || b.id}`}><Edit className="h-3.5 w-3.5" /></Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this banner? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteBannerMutation.mutate(b._id || b.id!)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </SectionCard>
              )}
            />
          </div>
        </TabsContent>

        <TabsContent value="pages">
          <SectionCard title="Landing pages">
            <div className="divide-y divide-border">
              <ContentList
                items={pages}
                isLoading={isPagesLoading}
                isError={isPagesError}
                emptyTitle="No landing pages found"
                renderItem={(p: ContentItem) => (
                  <div key={p._id || p.id || p.slug} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        /{p.slug} {p.updatedAt ? `· updated ${new Date(p.updatedAt).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status || "draft"} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/content/${p._id || p.id}`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Content</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this page? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteContentMutation.mutate(p._id || p.id!)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="blog">
          <SectionCard title="Blog posts">
            <div className="divide-y divide-border">
              <ContentList
                items={blogs}
                isLoading={isBlogLoading}
                isError={isBlogError}
                emptyTitle="No blog posts found"
                renderItem={(p: ContentItem) => (
                  <div key={p._id || p.id || p.slug} className="grid grid-cols-[1fr_auto] items-center gap-3 py-3">
                    <div>
                      <p className="text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.author?.name || "Editorial"} · {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={p.status || "draft"} />
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/content/${p._id || p.id}`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this blog post? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteContentMutation.mutate(p._id || p.id!)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="faq">
          <SectionCard title="Frequently asked questions">
            <div className="space-y-3">
              <ContentList
                items={faqs}
                isLoading={isFaqLoading}
                isError={isFaqError}
                emptyTitle="No FAQs found"
                renderItem={(f: ContentItem) => (
                  <div key={f._id || f.id || f.title} className="rounded-lg border border-border p-4 relative group">
                    <p className="text-sm font-medium pr-16">{f.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: f.content || "" }} />
                    <div className="absolute top-3 right-3 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <Link to={`/content/${f._id || f.id}`}><Edit className="h-4 w-4" /></Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this FAQ? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteContentMutation.mutate(f._id || f.id!)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              />
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="policies">
          <SectionCard title="Legal & policy pages">
            <div className="divide-y divide-border">
              <ContentList
                items={policies}
                isLoading={isPolicyLoading}
                isError={isPolicyError}
                emptyTitle="No policies found"
                renderItem={(p: ContentItem) => (
                  <div key={p._id || p.id || p.title} className="flex items-center justify-between py-3">
                    <span className="text-sm font-medium">{p.title}</span>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/content/${p._id || p.id}`}>Edit</Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Policy</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this policy? This cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteContentMutation.mutate(p._id || p.id!)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}
              />
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
