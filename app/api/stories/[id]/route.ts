import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Story from "@/lib/models/Story";
import Task from "@/lib/models/Task";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const story = await Story.findById(id);

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        const formattedStory = {
            id: story._id.toString(),
            name: story.name,
            description: story.description,
            priority: story.priority,
            projectId: story.projectId.toString(),
            createdAt: story.createdAt,
            status: story.status,
            ownerId: story.ownerId.toString(),
        };

        return NextResponse.json(formattedStory);
    } catch (error) {
        console.error("Error fetching story:", error);
        return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json();

        const story = await Story.findByIdAndUpdate(id, body, { new: true });

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        const formattedStory = {
            id: story._id.toString(),
            name: story.name,
            description: story.description,
            priority: story.priority,
            projectId: story.projectId.toString(),
            createdAt: story.createdAt,
            status: story.status,
            ownerId: story.ownerId.toString(),
        };

        return NextResponse.json(formattedStory);
    } catch (error) {
        console.error("Error updating story:", error);
        return NextResponse.json({ error: "Failed to update story" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const { id } = await params;

        // First delete all related tasks
        await Task.deleteMany({ storyId: id });

        // Then delete the story
        const story = await Story.findByIdAndDelete(id);

        if (!story) {
            return NextResponse.json({ error: "Story not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting story:", error);
        return NextResponse.json({ error: "Failed to delete story" }, { status: 500 });
    }
}
