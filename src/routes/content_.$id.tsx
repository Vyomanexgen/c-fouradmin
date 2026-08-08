import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ContentForm } from '@/components/content/ContentForm';
import { getContentItemById } from '@/api/contentApi';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/content_/$id')({
  component: ContentEditComponent,
});

function ContentEditComponent() {
  const { id } = Route.useParams();

  const { data: contentItem, isLoading, isError } = useQuery({
    queryKey: ['contentItem', id],
    queryFn: () => getContentItemById(id),
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !contentItem) {
    return (
      <div className="flex h-[400px] w-full flex-col items-center justify-center">
        <h2 className="text-xl font-semibold">Content not found</h2>
        <p className="text-muted-foreground">The content item you are trying to edit does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <ContentForm initialData={contentItem} isEdit={true} />
    </div>
  );
}
