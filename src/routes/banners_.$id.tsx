import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { BannerForm } from '@/components/marketing/BannerForm';
import { getBannerById } from '@/api/marketingApi';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/banners_/$id')({
  component: BannersEditComponent,
});

function BannersEditComponent() {
  const { id } = Route.useParams();

  const { data: banner, isLoading, isError } = useQuery({
    queryKey: ['banner', id],
    queryFn: () => getBannerById(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !banner) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Banner not found</h2>
        <p className="text-muted-foreground">The banner you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <BannerForm initialData={banner} isEdit={true} />
    </div>
  );
}
