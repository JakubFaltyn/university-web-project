import { router, publicProcedure } from "../trpc";
import User from "../models/User";
import Project from "../models/Project";
import Story from "../models/Story";
import Task from "../models/Task";

export const initRouter = router({
    // Initialize database with sample data
    initializeDatabase: publicProcedure.mutation(async () => {
        try {
            // Clear existing data
            await User.deleteMany({});
            await Project.deleteMany({});
            await Story.deleteMany({});
            await Task.deleteMany({});

            // Create the 3 default users
            const users = await User.insertMany([
                {
                    firstName: "Admin",
                    lastName: "Manager",
                    role: "admin",
                    email: "admin@university.com",
                },
                {
                    firstName: "John",
                    lastName: "Developer",
                    role: "developer",
                    email: "john.developer@university.com",
                },
                {
                    firstName: "Jane",
                    lastName: "DevOps",
                    role: "devops",
                    email: "jane.devops@university.com",
                },
            ]);

            // Create projects that are accessible to all users
            const projects = await Project.insertMany([
                {
                    name: "University Web Platform",
                    description: "Main university web platform for students and faculty management",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Mobile Learning App",
                    description: "Mobile application for online learning and course management",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Infrastructure & DevOps",
                    description: "Infrastructure management and deployment automation",
                    createdAt: new Date().toISOString(),
                },
            ]);

            // Set default projects for users (but all projects are accessible to everyone)
            await User.findByIdAndUpdate(users[0]._id, { defaultProjectId: projects[0]._id }); // Admin -> University Web Platform
            await User.findByIdAndUpdate(users[1]._id, { defaultProjectId: projects[0]._id }); // Developer -> University Web Platform
            await User.findByIdAndUpdate(users[2]._id, { defaultProjectId: projects[2]._id }); // DevOps -> Infrastructure

            // Create stories for each project with different owners
            const stories = await Story.insertMany([
                // University Web Platform stories
                {
                    name: "Student Authentication System",
                    description: "Implement secure login and registration for students and faculty",
                    priority: "high",
                    projectId: projects[0]._id,
                    createdAt: new Date().toISOString(),
                    status: "doing",
                    ownerId: users[1]._id, // Developer
                },
                {
                    name: "Course Management Dashboard",
                    description: "Create dashboard for course creation and management",
                    priority: "high",
                    projectId: projects[0]._id,
                    createdAt: new Date().toISOString(),
                    status: "todo",
                    ownerId: users[0]._id, // Admin
                },
                {
                    name: "Grade Tracking System",
                    description: "System for tracking and managing student grades",
                    priority: "medium",
                    projectId: projects[0]._id,
                    createdAt: new Date().toISOString(),
                    status: "todo",
                    ownerId: users[1]._id, // Developer
                },

                // Mobile Learning App stories
                {
                    name: "Mobile App Architecture",
                    description: "Design and implement the core mobile app architecture",
                    priority: "high",
                    projectId: projects[1]._id,
                    createdAt: new Date().toISOString(),
                    status: "doing",
                    ownerId: users[1]._id, // Developer
                },
                {
                    name: "Offline Content Sync",
                    description: "Enable offline access to course materials",
                    priority: "medium",
                    projectId: projects[1]._id,
                    createdAt: new Date().toISOString(),
                    status: "todo",
                    ownerId: users[1]._id, // Developer
                },

                // Infrastructure & DevOps stories
                {
                    name: "CI/CD Pipeline Setup",
                    description: "Implement automated deployment pipeline",
                    priority: "high",
                    projectId: projects[2]._id,
                    createdAt: new Date().toISOString(),
                    status: "doing",
                    ownerId: users[2]._id, // DevOps
                },
                {
                    name: "Monitoring & Alerting",
                    description: "Set up comprehensive monitoring and alerting system",
                    priority: "medium",
                    projectId: projects[2]._id,
                    createdAt: new Date().toISOString(),
                    status: "todo",
                    ownerId: users[2]._id, // DevOps
                },
            ]);

            // Create tasks assigned to different users
            await Task.insertMany([
                // Student Authentication System tasks
                {
                    name: "Design login UI components",
                    description: "Create reusable login form components with proper validation",
                    priority: "medium",
                    storyId: stories[0]._id,
                    estimatedTime: 6,
                    status: "done",
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    assignedUserId: users[1]._id, // Developer
                },
                {
                    name: "Implement JWT authentication",
                    description: "Set up JWT token handling and session management",
                    priority: "high",
                    storyId: stories[0]._id,
                    estimatedTime: 12,
                    status: "doing",
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    assignedUserId: users[1]._id, // Developer
                },
                {
                    name: "Setup OAuth integration",
                    description: "Integrate with Google OAuth for external authentication",
                    priority: "medium",
                    storyId: stories[0]._id,
                    estimatedTime: 8,
                    status: "todo",
                    createdAt: new Date().toISOString(),
                },

                // Course Management Dashboard tasks
                {
                    name: "Design course creation form",
                    description: "Create intuitive form for course creation with validation",
                    priority: "high",
                    storyId: stories[1]._id,
                    estimatedTime: 8,
                    status: "todo",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Implement course listing",
                    description: "Display courses with search and filter functionality",
                    priority: "medium",
                    storyId: stories[1]._id,
                    estimatedTime: 10,
                    status: "todo",
                    createdAt: new Date().toISOString(),
                },

                // Mobile App Architecture tasks
                {
                    name: "Setup React Native project",
                    description: "Initialize React Native project with proper structure",
                    priority: "high",
                    storyId: stories[3]._id,
                    estimatedTime: 4,
                    status: "done",
                    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                    assignedUserId: users[1]._id, // Developer
                },
                {
                    name: "Implement navigation system",
                    description: "Set up navigation between app screens",
                    priority: "medium",
                    storyId: stories[3]._id,
                    estimatedTime: 6,
                    status: "doing",
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    assignedUserId: users[1]._id, // Developer
                },

                // CI/CD Pipeline tasks
                {
                    name: "Configure GitHub Actions",
                    description: "Set up automated testing and deployment workflows",
                    priority: "high",
                    storyId: stories[5]._id,
                    estimatedTime: 12,
                    status: "doing",
                    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    assignedUserId: users[2]._id, // DevOps
                },
                {
                    name: "Setup Docker containers",
                    description: "Containerize applications for consistent deployment",
                    priority: "medium",
                    storyId: stories[5]._id,
                    estimatedTime: 8,
                    status: "todo",
                    createdAt: new Date().toISOString(),
                },

                // Monitoring tasks
                {
                    name: "Install Prometheus monitoring",
                    description: "Set up Prometheus for metrics collection",
                    priority: "medium",
                    storyId: stories[6]._id,
                    estimatedTime: 6,
                    status: "todo",
                    createdAt: new Date().toISOString(),
                },
            ]);

            return {
                message: "Database initialized successfully with 3 default users and shared projects",
                stats: {
                    users: users.length,
                    projects: projects.length,
                    stories: stories.length,
                    tasks: 10,
                },
                users: users.map((user) => ({
                    id: user._id.toString(),
                    name: `${user.firstName} ${user.lastName}`,
                    role: user.role,
                    email: user.email,
                })),
                note: "All projects are accessible to all users. Default projects are set but users can switch between any project.",
            };
        } catch (error) {
            console.error("Error initializing database:", error);
            throw new Error("Failed to initialize database");
        }
    }),
});
