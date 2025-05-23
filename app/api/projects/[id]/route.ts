import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/lib/models/Project";
import Story from "@/lib/models/Story";
import Task from "@/lib/models/Task";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const project = await Project.findById(id);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const formattedProject = {
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
        };

        return NextResponse.json(formattedProject);
    } catch (error) {
        console.error("Error fetching project:", error);
        return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const project = await Project.findByIdAndUpdate(id, body, { new: true });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        const formattedProject = {
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
        };

        return NextResponse.json(formattedProject);
    } catch (error) {
        console.error("Error updating project:", error);
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        // First delete all related stories and tasks
        const stories = await Story.find({ projectId: id });
        const storyIds = stories.map((story) => story._id);

        // Delete all tasks related to these stories
        await Task.deleteMany({ storyId: { $in: storyIds } });

        // Delete all stories related to this project
        await Story.deleteMany({ projectId: id });

        // Finally delete the project
        const project = await Project.findByIdAndDelete(id);

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting project:", error);
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
