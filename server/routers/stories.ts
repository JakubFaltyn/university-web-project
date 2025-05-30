import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import Story, { type IStory } from "../models/Story";

// Input schemas
const createStorySchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["low", "medium", "high"]),
    projectId: z.string(),
    status: z.enum(["todo", "doing", "done"]).default("todo"),
    ownerId: z.string(),
    autoUpdateStatus: z.boolean().default(false),
});

const updateStorySchema = createStorySchema.partial().extend({
    id: z.string(),
});

// Helper function to format story
const formatStory = (story: IStory) => ({
    id: story._id.toString(),
    name: story.name,
    description: story.description,
    priority: story.priority,
    projectId: story.projectId.toString(),
    createdAt: story.createdAt,
    status: story.status,
    ownerId: story.ownerId.toString(),
});

export const storiesRouter = router({
    // Get all stories with optional project filter
    getAll: publicProcedure
        .input(
            z
                .object({
                    projectId: z.string().optional(),
                })
                .optional()
        )
        .query(async ({ input }) => {
            try {
                const filter = input?.projectId ? { projectId: input.projectId } : {};
                const stories = await Story.find(filter);
                return stories.map(formatStory);
            } catch (error) {
                console.error("Error fetching stories:", error);
                throw new Error("Failed to fetch stories");
            }
        }),

    // Get single story by ID
    getById: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                const story = await Story.findById(input.id);
                if (!story) {
                    throw new Error("Story not found");
                }
                return formatStory(story);
            } catch (error) {
                console.error("Error fetching story:", error);
                throw new Error("Failed to fetch story");
            }
        }),

    // Create new story
    create: publicProcedure.input(createStorySchema).mutation(async ({ input }) => {
        try {
            const storyData = {
                ...input,
                createdAt: new Date().toISOString(),
            };

            const story = new Story(storyData);
            await story.save();
            return formatStory(story);
        } catch (error) {
            console.error("Error creating story:", error);
            throw new Error("Failed to create story");
        }
    }),

    // Update story
    update: publicProcedure.input(updateStorySchema).mutation(async ({ input }) => {
        try {
            const { id, ...updateData } = input;
            const story = await Story.findByIdAndUpdate(id, updateData, { new: true });

            if (!story) {
                throw new Error("Story not found");
            }

            return formatStory(story);
        } catch (error) {
            console.error("Error updating story:", error);
            throw new Error("Failed to update story");
        }
    }),

    // Delete story
    delete: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const story = await Story.findByIdAndDelete(input.id);

                if (!story) {
                    throw new Error("Story not found");
                }

                return { success: true };
            } catch (error) {
                console.error("Error deleting story:", error);
                throw new Error("Failed to delete story");
            }
        }),
});
