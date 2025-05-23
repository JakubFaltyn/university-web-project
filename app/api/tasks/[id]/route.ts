import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/lib/models/Task";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const task = await Task.findById(params.id);

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const formattedTask = {
            id: task._id.toString(),
            name: task.name,
            description: task.description,
            priority: task.priority,
            storyId: task.storyId.toString(),
            estimatedTime: task.estimatedTime,
            status: task.status,
            createdAt: task.createdAt,
            startDate: task.startDate,
            endDate: task.endDate,
            assignedUserId: task.assignedUserId?.toString(),
        };

        return NextResponse.json(formattedTask);
    } catch (error) {
        console.error("Error fetching task:", error);
        return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const body = await request.json();

        const task = await Task.findByIdAndUpdate(params.id, body, { new: true });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const formattedTask = {
            id: task._id.toString(),
            name: task.name,
            description: task.description,
            priority: task.priority,
            storyId: task.storyId.toString(),
            estimatedTime: task.estimatedTime,
            status: task.status,
            createdAt: task.createdAt,
            startDate: task.startDate,
            endDate: task.endDate,
            assignedUserId: task.assignedUserId?.toString(),
        };

        return NextResponse.json(formattedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDB();
        const task = await Task.findByIdAndDelete(params.id);

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting task:", error);
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
