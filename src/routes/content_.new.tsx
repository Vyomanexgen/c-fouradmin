import { createFileRoute } from '@tanstack/react-router';
import { ContentForm } from '@/components/content/ContentForm';

export const Route = createFileRoute('/content_/new')({
  component: ContentNewComponent,
});

function ContentNewComponent() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ContentForm />
    </div>
  );
}
