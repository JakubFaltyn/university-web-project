import TaskBoard from "@/components/TaskBoard";

export default function TasksPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Tasks</h1>
            <TaskBoard />
        </div>
    );
}
