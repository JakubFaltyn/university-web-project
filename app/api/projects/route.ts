import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/lib/models/Project";

export async function GET() {
    try {
        await connectDB();
        const projects = await Project.find({});

        // Convert MongoDB documents to our format
        const formattedProjects = projects.map((project) => ({
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
        }));

        return NextResponse.json(formattedProjects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        // Add createdAt timestamp
        const projectData = {
            ...body,
            createdAt: new Date().toISOString(),
        };

        const project = new Project(projectData);
        await project.save();

        // Convert to our format
        const formattedProject = {
            id: project._id.toString(),
            name: project.name,
            description: project.description,
            createdAt: project.createdAt,
        };

        return NextResponse.json(formattedProject, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }
}
