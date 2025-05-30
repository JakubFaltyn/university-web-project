import { HydrateClient, prefetch, trpc } from "@/lib/trpc/server";
import { KanbanBoard } from "@/features/tasks/components/kanban-board";

interface ProjectTasksPageProps {
    params: {
        id: string;
    };
}

export default async function ProjectTasksPage({ params }: ProjectTasksPageProps) {
    const { id: projectId } = await params;

    // Prefetch data for this project using helper function
    prefetch(trpc.tasks.getAll.queryOptions());
    prefetch(trpc.stories.getAll.queryOptions({ projectId }));
    prefetch(trpc.projects.getAll.queryOptions());

    return (
        <HydrateClient>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold">Tasks</h1>
                    <p className="text-muted-foreground">Manage tasks for your project</p>
                </div>

                <KanbanBoard projectId={projectId} />
            </div>
        </HydrateClient>
    );
} 