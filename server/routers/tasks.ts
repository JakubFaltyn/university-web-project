import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import Task, { type ITask } from "../models/Task";

// Input schemas
const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    status: z.enum(["todo", "doing", "done"]).default("todo"),
    assignedUserId: z.string().optional(),
    storyId: z.string(),
    estimatedTime: z.number().min(0.5),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
    id: z.string(),
});

// Helper function to format task
const formatTask = (task: ITask) => ({
    id: task._id.toString(),
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assignedUserId: task.assignedUserId?.toString(),
    storyId: task.storyId.toString(),
    estimatedTime: task.estimatedTime,
    startDate: task.startDate,
    endDate: task.endDate,
    createdAt: task.createdAt,
});

export const tasksRouter = router({
    // Get all tasks
    getAll: publicProcedure.query(async () => {
        try {
            const tasks = await Task.find({});
            return tasks.map(formatTask);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            throw new Error("Failed to fetch tasks");
        }
    }),

    // Get tasks by story ID
    getByStoryId: publicProcedure
        .input(
            z.object({
                storyId: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                const tasks = await Task.find({ storyId: input.storyId });
                return tasks.map(formatTask);
            } catch (error) {
                console.error("Error fetching tasks by story ID:", error);
                throw new Error("Failed to fetch tasks");
            }
        }),

    // Get single task by ID
    getById: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                const task = await Task.findById(input.id);
                if (!task) {
                    throw new Error("Task not found");
                }
                return formatTask(task);
            } catch (error) {
                console.error("Error fetching task:", error);
                throw new Error("Failed to fetch task");
            }
        }),

    // Create new task
    create: publicProcedure.input(createTaskSchema).mutation(async ({ input }) => {
        try {
            const taskData = {
                ...input,
                createdAt: new Date().toISOString(),
            };

            const task = new Task(taskData);
            await task.save();
            return formatTask(task);
        } catch (error) {
            console.error("Error creating task:", error);
            throw new Error("Failed to create task");
        }
    }),

    // Update task
    update: publicProcedure.input(updateTaskSchema).mutation(async ({ input }) => {
        try {
            const { id, ...updateData } = input;

            // Handle status changes with automatic date updates
            if (updateData.status === "doing" && !updateData.startDate) {
                updateData.startDate = new Date().toISOString();
            }
            if (updateData.status === "done" && !updateData.endDate) {
                updateData.endDate = new Date().toISOString();
            }

            const task = await Task.findByIdAndUpdate(id, updateData, { new: true });

            if (!task) {
                throw new Error("Task not found");
            }

            return formatTask(task);
        } catch (error) {
            console.error("Error updating task:", error);
            throw new Error("Failed to update task");
        }
    }),

    // Delete task
    delete: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const task = await Task.findByIdAndDelete(input.id);

                if (!task) {
                    throw new Error("Task not found");
                }

                return { success: true };
            } catch (error) {
                console.error("Error deleting task:", error);
                throw new Error("Failed to delete task");
            }
        }),
});
