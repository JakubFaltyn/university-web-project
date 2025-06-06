import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { useDndContext, type UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo } from "react";
import { TaskCard } from "./task-card";
import { cva } from "class-variance-authority";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical } from "lucide-react";
import { Task } from "@lib/types";

export interface Column {
    id: UniqueIdentifier;
    title: string;
}

export type ColumnType = "Column";

export interface ColumnDragData {
    type: ColumnType;
    column: Column;
}

interface BoardColumnProps {
    column: Column;
    tasks: Task[];
    isOverlay?: boolean;
    onViewTaskDetails?: (task: Task) => void;
    onEditTask?: (task: Task) => void;
}

export function BoardColumn({ column, tasks, isOverlay, onViewTaskDetails, onEditTask }: BoardColumnProps) {
    const tasksIds = useMemo(() => {
        return tasks.map((task) => task.id);
    }, [tasks]);

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        } satisfies ColumnDragData,
        attributes: {
            roleDescription: `Column: ${column.title}`,
        },
    });

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
    };

    const variants = cva("min-h-[400px] w-[350px] min-w-[350px] bg-secondary flex flex-col flex-shrink-0", {
        variants: {
            dragging: {
                default: "border-2 border-transparent",
                over: "ring-2 opacity-30",
                overlay: "ring-2 ring-primary",
            },
        },
    });

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={variants({
                dragging: isOverlay ? "overlay" : isDragging ? "over" : undefined,
            })}>
            <CardHeader className="p-4 font-semibold border-b-2 text-left flex flex-row space-between items-center">
                <Button variant={"ghost"} {...attributes} {...listeners} className=" p-1 text-primary/50 -ml-2 h-auto cursor-grab relative">
                    <span className="sr-only">{`Move column: ${column.title}`}</span>
                    <GripVertical />
                </Button>
                <span className="ml-auto"> {column.title}</span>
            </CardHeader>
            <CardContent className="flex flex-grow flex-col gap-4 p-2">
                <SortableContext items={tasksIds}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onViewTaskDetails={onViewTaskDetails} onEditTask={onEditTask} />
                    ))}
                </SortableContext>
            </CardContent>
        </Card>
    );
}

export function BoardContainer({ children }: { children: React.ReactNode }) {
    const dndContext = useDndContext();

    const variations = cva("overflow-x-auto px-2 md:px-0 flex justify-start", {
        variants: {
            dragging: {
                default: "",
                active: "",
            },
        },
    });

    return (
        <div
            className={variations({
                dragging: dndContext.active ? "active" : "default",
            })}>
            <div className="flex gap-4 items-start flex-row">{children}</div>
        </div>
    );
}
