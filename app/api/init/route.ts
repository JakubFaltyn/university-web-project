import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Project from "@/lib/models/Project";
import Story from "@/lib/models/Story";
import Task from "@/lib/models/Task";

export async function POST() {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Story.deleteMany({});
        await Task.deleteMany({});

        // Create users
        const users = await User.insertMany([
            {
                firstName: "Admin",
                lastName: "User",
                role: "admin",
                email: "admin@example.com",
            },
            {
                firstName: "John",
                lastName: "Developer",
                role: "developer",
                email: "john@example.com",
            },
            {
                firstName: "Jane",
                lastName: "DevOps",
                role: "devops",
                email: "jane@example.com",
            },
            {
                firstName: "Bob",
                lastName: "Developer",
                role: "developer",
                email: "bob@example.com",
            },
        ]);

        // Create projects
        const projects = await Project.insertMany([
            {
                name: "E-commerce Platform",
                description: "Building a modern e-commerce platform with React and Node.js",
                createdAt: new Date().toISOString(),
            },
            {
                name: "Mobile App",
                description: "Creating a mobile application for iOS and Android",
                createdAt: new Date().toISOString(),
            },
        ]);

        // Update users with default projects
        await User.findByIdAndUpdate(users[0]._id, { defaultProjectId: projects[0]._id }); // Admin -> E-commerce Platform
        await User.findByIdAndUpdate(users[1]._id, { defaultProjectId: projects[0]._id }); // John Developer -> E-commerce Platform
        await User.findByIdAndUpdate(users[2]._id, { defaultProjectId: projects[1]._id }); // Jane DevOps -> Mobile App
        await User.findByIdAndUpdate(users[3]._id, { defaultProjectId: projects[0]._id }); // Bob Developer -> E-commerce Platform

        // Create stories
        const stories = await Story.insertMany([
            {
                name: "User Authentication",
                description: "Implement user login and registration functionality",
                priority: "high",
                projectId: projects[0]._id,
                createdAt: new Date().toISOString(),
                status: "todo",
                ownerId: users[1]._id,
            },
            {
                name: "Product Catalog",
                description: "Create product listing and search functionality",
                priority: "medium",
                projectId: projects[0]._id,
                createdAt: new Date().toISOString(),
                status: "doing",
                ownerId: users[1]._id,
            },
            {
                name: "Shopping Cart",
                description: "Implement shopping cart functionality",
                priority: "high",
                projectId: projects[0]._id,
                createdAt: new Date().toISOString(),
                status: "todo",
                ownerId: users[3]._id,
            },
        ]);

        // Create tasks
        await Task.insertMany([
            {
                name: "Design login form",
                description: "Create UI components for login form",
                priority: "medium",
                storyId: stories[0]._id,
                estimatedTime: 4,
                status: "todo",
                createdAt: new Date().toISOString(),
            },
            {
                name: "Implement JWT authentication",
                description: "Set up JWT token handling for user sessions",
                priority: "high",
                storyId: stories[0]._id,
                estimatedTime: 8,
                status: "doing",
                createdAt: new Date().toISOString(),
                startDate: new Date().toISOString(),
                assignedUserId: users[1]._id,
            },
            {
                name: "Create product search",
                description: "Implement search functionality for products",
                priority: "medium",
                storyId: stories[1]._id,
                estimatedTime: 6,
                status: "todo",
                createdAt: new Date().toISOString(),
            },
            {
                name: "Add to cart functionality",
                description: "Allow users to add products to their cart",
                priority: "high",
                storyId: stories[2]._id,
                estimatedTime: 5,
                status: "todo",
                createdAt: new Date().toISOString(),
            },
        ]);

        return NextResponse.json({
            message: "Database initialized successfully",
            stats: {
                users: users.length,
                projects: projects.length,
                stories: stories.length,
                tasks: 4,
            },
        });
    } catch (error) {
        console.error("Error initializing database:", error);
        return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 });
    }
}
