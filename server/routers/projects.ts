import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import Project, { type IProject } from "../models/Project";

// Input schemas
const createProjectSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

const updateProjectSchema = createProjectSchema.partial().extend({
    id: z.string(),
});

// Helper function to format project
const formatProject = (project: IProject) => ({
    id: project._id.toString(),
    name: project.name,
    description: project.description,
    createdAt: project.createdAt,
});

export const projectsRouter = router({
    // Get all projects
    getAll: publicProcedure.query(async () => {
        try {
            const projects = await Project.find({});
            return projects.map(formatProject);
        } catch (error) {
            console.error("Error fetching projects:", error);
            throw new Error("Failed to fetch projects");
        }
    }),

    // Get single project by ID
    getById: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                const project = await Project.findById(input.id);
                if (!project) {
                    throw new Error("Project not found");
                }
                return formatProject(project);
            } catch (error) {
                console.error("Error fetching project:", error);
                throw new Error("Failed to fetch project");
            }
        }),

    // Create new project
    create: publicProcedure.input(createProjectSchema).mutation(async ({ input }) => {
        try {
            const projectData = {
                ...input,
                createdAt: new Date().toISOString(),
            };

            const project = new Project(projectData);
            await project.save();
            return formatProject(project);
        } catch (error) {
            console.error("Error creating project:", error);
            throw new Error("Failed to create project");
        }
    }),

    // Update project
    update: publicProcedure.input(updateProjectSchema).mutation(async ({ input }) => {
        try {
            const { id, ...updateData } = input;
            const project = await Project.findByIdAndUpdate(id, updateData, { new: true });

            if (!project) {
                throw new Error("Project not found");
            }

            return formatProject(project);
        } catch (error) {
            console.error("Error updating project:", error);
            throw new Error("Failed to update project");
        }
    }),

    // Delete project
    delete: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const project = await Project.findByIdAndDelete(input.id);

                if (!project) {
                    throw new Error("Project not found");
                }

                return { success: true };
            } catch (error) {
                console.error("Error deleting project:", error);
                throw new Error("Failed to delete project");
            }
        }),
});
