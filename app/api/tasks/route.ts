import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/lib/models/Task";

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const storyId = searchParams.get("storyId");

        // Filter by story if storyId is provided
        const filter = storyId ? { storyId } : {};
        const tasks = await Task.find(filter);

        // Convert MongoDB documents to our format
        const formattedTasks = tasks.map((task) => ({
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
        }));

        return NextResponse.json(formattedTasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        // Add createdAt timestamp
        const taskData = {
            ...body,
            createdAt: new Date().toISOString(),
        };

        const task = new Task(taskData);
        await task.save();

        // Convert to our format
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

        return NextResponse.json(formattedTask, { status: 201 });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
