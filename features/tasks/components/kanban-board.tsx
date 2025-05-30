"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createPortal } from "react-dom";

import { BoardColumn, BoardContainer } from "./kanban-column";
import {
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    useSensor,
    useSensors,
    KeyboardSensor,
    Announcements,
    UniqueIdentifier,
    TouchSensor,
    MouseSensor,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { TaskCard } from "./task-card";
import { TaskDetailsModal } from "./task-details-modal";
import type { Column } from "./kanban-column";
import { hasDraggableData } from "../utils";
import { coordinateGetter } from "../multipleContainersKeyboardPreset";
import { Task, TaskStatus } from "@lib/types";
import { useAppStore } from "@lib/store";
import { useUpdateTaskMutation } from "../api/mutations";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskForm } from "../forms/task-form";

const defaultCols = [
    {
        id: "todo" as const,
        title: "Todo",
    },
    {
        id: "doing" as const,
        title: "In Progress",
    },
    {
        id: "done" as const,
        title: "Done",
    },
] satisfies Column[];

export type ColumnId = TaskStatus;

interface KanbanBoardProps {
    projectId?: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
    const { activeProject } = useAppStore();
    const [columns, setColumns] = useState<Column[]>(defaultCols);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showTaskDetails, setShowTaskDetails] = useState(false);
    const [showEditTask, setShowEditTask] = useState(false);
    const [showAddTask, setShowAddTask] = useState(false);
    const trpc = useTRPC();
    const router = useRouter();
    const params = useParams();

    // Get the current project ID from URL params or props
    const currentProjectId = projectId || (params?.id as string) || activeProject?.id;

    // Project switching logic - redirect to correct URL when activeProject changes
    useEffect(() => {
        if (activeProject && currentProjectId !== activeProject.id) {
            router.push(`/projects/${activeProject.id}/tasks`);
        }
    }, [activeProject, currentProjectId, router]);

    // Fetch data using tRPC with proper cache sharing
    const { data: tasks = [] } = useQuery(trpc.tasks.getAll.queryOptions());
    const { data: stories = [] } = useQuery(trpc.stories.getAll.queryOptions(currentProjectId ? { projectId: currentProjectId } : undefined));

    const pickedUpTaskColumn = useRef<ColumnId | null>(null);
    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    // Add tRPC mutation
    const updateTaskMutation = useUpdateTaskMutation();

    // Filter tasks for the active project (show all tasks from all stories)
    const projectTasks = useMemo(() => {
        if (!currentProjectId) return []; // Show no tasks if no project
        return tasks.filter((task) => {
            // Find the story for this task and check if it belongs to the current project
            const story = stories.find((s) => s.id === task.storyId);
            return story && story.projectId === currentProjectId;
        });
    }, [tasks, currentProjectId, stories]);

    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    // Get the first story of the current project for new tasks
    const firstProjectStory = stories.find((s) => s.projectId === currentProjectId);

    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: coordinateGetter,
        })
    );

    const handleViewTaskDetails = (task: Task) => {
        setSelectedTask(task);
        setShowTaskDetails(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setShowEditTask(true);
    };

    const handleTaskUpdated = () => {
        // Refresh task data - React Query will handle this automatically
        setShowTaskDetails(false);
        setShowEditTask(false);
        setSelectedTask(null);
        setEditingTask(null);
    };

    const handleAddTaskSuccess = () => {
        setShowAddTask(false);
    };

    function getDraggingTaskData(taskId: UniqueIdentifier, columnId: ColumnId) {
        const tasksInColumn = projectTasks.filter((task) => task.status === columnId);
        const taskPosition = tasksInColumn.findIndex((task) => task.id === taskId);
        const column = columns.find((col) => col.id === columnId);
        return {
            tasksInColumn,
            taskPosition,
            column,
        };
    }

    const announcements: Announcements = {
        onDragStart({ active }) {
            if (!hasDraggableData(active)) return;
            if (active.data.current?.type === "Column") {
                const startColumnIdx = columnsId.findIndex((id) => id === active.id);
                const startColumn = columns[startColumnIdx];
                return `Picked up Column ${startColumn?.title} at position: ${startColumnIdx + 1} of ${columnsId.length}`;
            } else if (active.data.current?.type === "Task") {
                pickedUpTaskColumn.current = active.data.current.task.status;
                const { tasksInColumn, taskPosition, column } = getDraggingTaskData(active.id, active.data.current.task.status);
                return `Picked up Task ${active.data.current.task.title} at position: ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
            }
        },
        onDragOver({ active, over }) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) return;

            if (active.data.current?.type === "Column" && over.data.current?.type === "Column") {
                const overColumnIdx = columnsId.findIndex((id) => id === over.id);
                return `Column ${active.data.current.column.title} was moved over ${over.data.current.column.title} at position ${overColumnIdx + 1} of ${columnsId.length}`;
            } else if (active.data.current?.type === "Task" && over.data.current?.type === "Task") {
                const { tasksInColumn, taskPosition, column } = getDraggingTaskData(over.id, over.data.current.task.status);
                if (over.data.current.task.status !== pickedUpTaskColumn.current) {
                    return `Task ${active.data.current.task.title} was moved over column ${column?.title} in position ${taskPosition + 1} of ${tasksInColumn.length}`;
                }
                return `Task was moved over position ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
            }
        },
        onDragEnd({ active, over }) {
            if (!hasDraggableData(active) || !hasDraggableData(over)) {
                pickedUpTaskColumn.current = null;
                return;
            }
            if (active.data.current?.type === "Column" && over.data.current?.type === "Column") {
                const overColumnPosition = columnsId.findIndex((id) => id === over.id);
                return `Column ${active.data.current.column.title} was dropped into position ${overColumnPosition + 1} of ${columnsId.length}`;
            } else if (active.data.current?.type === "Task" && over.data.current?.type === "Task") {
                const { tasksInColumn, taskPosition, column } = getDraggingTaskData(over.id, over.data.current.task.status);
                if (over.data.current.task.status !== pickedUpTaskColumn.current) {
                    return `Task was dropped into column ${column?.title} in position ${taskPosition + 1} of ${tasksInColumn.length}`;
                }
                return `Task was dropped into position ${taskPosition + 1} of ${tasksInColumn.length} in column ${column?.title}`;
            }
            pickedUpTaskColumn.current = null;
        },
        onDragCancel({ active }) {
            pickedUpTaskColumn.current = null;
            if (!hasDraggableData(active)) return;
            return `Dragging ${active.data.current?.type} cancelled.`;
        },
    };

    return (
        <div className="space-y-6">
            {/* Add Task Button */}
            {currentProjectId && firstProjectStory && (
                <div className="flex justify-end">
                    <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Task
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add New Task</DialogTitle>
                            </DialogHeader>
                            <TaskForm storyId={firstProjectStory.id} onSuccess={handleAddTaskSuccess} />
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            {currentProjectId && projectTasks.length > 0 && (
                <DndContext
                    accessibility={{
                        announcements,
                    }}
                    sensors={sensors}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}>
                    <BoardContainer>
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <BoardColumn
                                    key={col.id}
                                    column={col}
                                    tasks={projectTasks.filter((task) => task.status === col.id)}
                                    onViewTaskDetails={handleViewTaskDetails}
                                    onEditTask={handleEditTask}
                                />
                            ))}
                        </SortableContext>
                    </BoardContainer>

                    {"document" in window &&
                        createPortal(
                            <DragOverlay>
                                {activeColumn && (
                                    <BoardColumn
                                        isOverlay
                                        column={activeColumn}
                                        tasks={projectTasks.filter((task) => task.status === activeColumn.id)}
                                        onViewTaskDetails={handleViewTaskDetails}
                                        onEditTask={handleEditTask}
                                    />
                                )}
                                {activeTask && <TaskCard task={activeTask} isOverlay />}
                            </DragOverlay>,
                            document.body
                        )}
                </DndContext>
            )}

            {currentProjectId && projectTasks.length === 0 && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No tasks found for this project.</p>
                    {firstProjectStory && (
                        <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                            <DialogTrigger asChild>
                                <Button className="mt-4">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Task
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Add New Task</DialogTitle>
                                </DialogHeader>
                                <TaskForm storyId={firstProjectStory.id} onSuccess={handleAddTaskSuccess} />
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            )}

            {!currentProjectId && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">Select a project to view and manage tasks.</p>
                </div>
            )}

            {/* Task Details Modal */}
            <TaskDetailsModal task={selectedTask} open={showTaskDetails} onOpenChange={setShowTaskDetails} onTaskUpdated={handleTaskUpdated} />

            {/* Task Edit Modal */}
            <Dialog open={showEditTask} onOpenChange={setShowEditTask}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Task</DialogTitle>
                    </DialogHeader>
                    {editingTask && <TaskForm task={editingTask} storyId={editingTask.storyId} onSuccess={handleTaskUpdated} />}
                </DialogContent>
            </Dialog>
        </div>
    );

    function onDragStart(event: DragStartEvent) {
        if (!hasDraggableData(event.active)) return;
        const data = event.active.data.current;
        if (data?.type === "Column") {
            setActiveColumn(data.column);
            return;
        }

        if (data?.type === "Task") {
            setActiveTask(data.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (!hasDraggableData(active)) return;

        const activeData = active.data.current;
        const overData = over.data.current;

        if (activeId === overId) return;

        const isActiveAColumn = activeData?.type === "Column";
        const isActiveATask = activeData?.type === "Task";

        // Handle column reordering
        if (isActiveAColumn) {
            setColumns((columns) => {
                const activeColumnIndex = columns.findIndex((col) => col.id === activeId);
                const overColumnIndex = columns.findIndex((col) => col.id === overId);
                return arrayMove(columns, activeColumnIndex, overColumnIndex);
            });
            return;
        }

        // Handle task status updates
        if (isActiveATask && overData) {
            const activeTask = projectTasks.find((t) => t.id === activeId);
            if (!activeTask) return;

            const isOverATask = overData?.type === "Task";
            const isOverAColumn = overData?.type === "Column";

            // Dropping a Task over another Task
            if (isOverATask) {
                const overTask = projectTasks.find((t) => t.id === overId);
                if (overTask && activeTask.status !== overTask.status) {
                    const updatedTask = {
                        ...activeTask,
                        status: overTask.status,
                    };
                    // Update server - React Query will handle the optimistic update
                    updateTaskMutation.mutate(updatedTask);
                }
            }
            // Dropping a Task over a column
            else if (isOverAColumn && activeTask.status !== overId) {
                const updatedTask = {
                    ...activeTask,
                    status: overId as TaskStatus,
                };
                // Update server - React Query will handle the optimistic update
                updateTaskMutation.mutate(updatedTask);
            }
        }
    }

    function onDragOver(event: DragOverEvent) {
        // This function can be used for visual feedback during drag operations
        // but should not update any data - that happens only in onDragEnd
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        if (!hasDraggableData(active) || !hasDraggableData(over)) return;

        // You can add visual feedback logic here if needed
        // For example, highlighting drop zones, showing preview positions, etc.
        // But no data updates should happen here
    }
}
