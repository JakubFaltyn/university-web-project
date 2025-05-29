import { KanbanBoard } from "@features/tasks/components/KanbanBoard";
import { getTasksPageData } from "@lib/queries";

export default async function TasksPage() {
    // Fetch all required data using centralized queries
    const { tasks, stories, projects, users } = await getTasksPageData();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Tasks</h1>
            <KanbanBoard initialTasks={tasks} initialStories={stories} initialProjects={projects} initialUsers={users} />
        </div>
    );
}
