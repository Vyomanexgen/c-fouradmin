import { createFileRoute } from '@tanstack/react-router';
import { CampaignForm } from '@/components/marketing/CampaignForm';

export const Route = createFileRoute('/marketing_/new')({
  component: MarketingNewComponent,
});

function MarketingNewComponent() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <CampaignForm />
    </div>
  );
}
