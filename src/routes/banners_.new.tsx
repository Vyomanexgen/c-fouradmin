import { createFileRoute } from '@tanstack/react-router';
import { BannerForm } from '@/components/marketing/BannerForm';

export const Route = createFileRoute('/banners_/new')({
  component: BannersNewComponent,
});

function BannersNewComponent() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <BannerForm />
    </div>
  );
}
