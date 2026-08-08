import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { CampaignForm } from '@/components/marketing/CampaignForm';
import { getCampaignById } from '@/api/marketingApi';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/marketing_/$id')({
  component: MarketingEditComponent,
});

function MarketingEditComponent() {
  const { id } = Route.useParams();

  const { data: campaign, isLoading, isError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => getCampaignById(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Campaign not found</h2>
        <p className="text-muted-foreground">The campaign you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CampaignForm initialData={campaign} isEdit={true} />
    </div>
  );
}
