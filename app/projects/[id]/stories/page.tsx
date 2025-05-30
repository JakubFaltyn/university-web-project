import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { StoryList } from "@/features/stories/story-list";

interface ProjectStoriesPageProps {
    params: {
        id: string;
    };
}

export default async function ProjectStoriesPage({ params }: ProjectStoriesPageProps) {
    const { id: projectId } = await params;

    // Prefetch data for this project using helper function
    prefetch(trpc.stories.getAll.queryOptions({ projectId }));
    prefetch(trpc.projects.getAll.queryOptions());

    return (
        <HydrateClient>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Stories</h1>
                    <p className="text-muted-foreground">Manage user stories for your project</p>
                </div>

                <StoryList projectId={projectId} />
            </div>
        </HydrateClient>
    );
}
