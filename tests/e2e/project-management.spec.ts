import { test, expect } from "@playwright/test";
import { AuthHelper } from "./utils/auth";
import { ProjectHelper } from "./utils/project-helpers";
import { StoryHelper } from "./utils/story-helpers";
import { TaskHelper } from "./utils/task-helpers";

test.describe("ManagMe Project Management", () => {
    let authHelper: AuthHelper;
    let projectHelper: ProjectHelper;
    let storyHelper: StoryHelper;
    let taskHelper: TaskHelper;

    test.beforeEach(async ({ page }) => {
        authHelper = new AuthHelper(page);
        projectHelper = new ProjectHelper(page);
        storyHelper = new StoryHelper(page);
        taskHelper = new TaskHelper(page);

        // Ensure user is logged in before each test
        await authHelper.ensureLoggedIn();
    });

    test("Complete project management workflow", async ({ page }) => {
        // Test data
        const projectData = {
            name: "E2E Test Project",
            description: "A project created during end-to-end testing",
        };

        const storyData = {
            name: "E2E Test Story",
            description: "A story created during end-to-end testing",
            priority: "high" as const,
        };

        const taskData = {
            title: "E2E Test Task",
            description: "A task created during end-to-end testing",
            priority: "medium" as const,
            estimatedTime: 16,
        };

        // Step 1: Create a new project
        const createdProject = await projectHelper.createProject(projectData.name, projectData.description);
        expect(createdProject.name).toBe(projectData.name);

        // Step 2: Select the project as active
        await projectHelper.selectProject(projectData.name);

        // Step 3: Create a new story in the project
        const createdStory = await storyHelper.createStory(storyData.name, storyData.description, storyData.priority);
        expect(createdStory.name).toBe(storyData.name);

        // Step 4: Create a new task in the story
        const createdTask = await taskHelper.createTask(taskData.title, taskData.description, storyData.name, taskData.priority, taskData.estimatedTime);
        expect(createdTask.title).toBe(taskData.title);

        // Step 5: Change task status from todo to doing
        await taskHelper.changeTaskStatus(taskData.title, "doing", "admin@test.com");

        // Step 6: Change task status to done
        await taskHelper.changeTaskStatus(taskData.title, "done");

        // Step 7: Verify kanban board functionality
        await taskHelper.verifyKanbanBoard();

        // Step 8: Edit the task
        const updatedTaskData = {
            title: "Updated E2E Test Task",
            description: "An updated task description",
            priority: "high" as const,
            estimatedTime: 24,
        };

        await taskHelper.editTask(taskData.title, updatedTaskData.title, updatedTaskData.description, updatedTaskData.priority, updatedTaskData.estimatedTime);

        // Step 9: Edit the story
        const updatedStoryData = {
            name: "Updated E2E Test Story",
            description: "An updated story description",
            priority: "low" as const,
        };

        await storyHelper.editStory(storyData.name, updatedStoryData.name, updatedStoryData.description, updatedStoryData.priority);

        // Step 10: Edit the project
        const updatedProjectData = {
            name: "Updated E2E Test Project",
            description: "An updated project description",
        };

        await projectHelper.editProject(projectData.name, updatedProjectData.name, updatedProjectData.description);

        // Step 11: Delete the task
        await taskHelper.deleteTask(updatedTaskData.title);

        // Step 12: Delete the story
        await storyHelper.deleteStory(updatedStoryData.name);

        // Step 13: Delete the project
        await projectHelper.deleteProject(updatedProjectData.name);
    });

    test("Task status workflow", async ({ page }) => {
        // Create test data
        const projectName = "Task Status Test Project";
        const storyName = "Task Status Test Story";
        const taskTitle = "Status Workflow Task";

        // Setup
        await projectHelper.createProject(projectName, "Test project for task status workflow");
        await projectHelper.selectProject(projectName);
        await storyHelper.createStory(storyName, "Test story for task status workflow");
        await taskHelper.createTask(taskTitle, "Test task for status workflow", storyName);

        // Test status changes
        await taskHelper.changeTaskStatus(taskTitle, "doing", "developer@test.com");
        await taskHelper.changeTaskStatus(taskTitle, "done");

        // Verify in kanban board
        await taskHelper.verifyKanbanBoard();

        // Cleanup
        await taskHelper.deleteTask(taskTitle);
        await storyHelper.deleteStory(storyName);
        await projectHelper.deleteProject(projectName);
    });

    test("Kanban board drag and drop", async ({ page }) => {
        // Create test data
        const projectName = "Kanban Test Project";
        const storyName = "Kanban Test Story";
        const taskTitle = "Kanban Drag Test Task";

        // Setup
        await projectHelper.createProject(projectName, "Test project for kanban functionality");
        await projectHelper.selectProject(projectName);
        await storyHelper.createStory(storyName, "Test story for kanban functionality");
        await taskHelper.createTask(taskTitle, "Test task for kanban drag and drop", storyName);

        // Test drag and drop functionality
        await taskHelper.moveTaskInKanban(taskTitle, "todo", "doing");
        await taskHelper.moveTaskInKanban(taskTitle, "doing", "done");

        // Cleanup
        await taskHelper.deleteTask(taskTitle);
        await storyHelper.deleteStory(storyName);
        await projectHelper.deleteProject(projectName);
    });

    test("User assignment workflow", async ({ page }) => {
        // Create test data
        const projectName = "Assignment Test Project";
        const storyName = "Assignment Test Story";
        const taskTitle = "Assignment Test Task";

        // Setup
        await projectHelper.createProject(projectName, "Test project for user assignment");
        await projectHelper.selectProject(projectName);
        await storyHelper.createStory(storyName, "Test story for user assignment");
        await taskHelper.createTask(taskTitle, "Test task for user assignment", storyName);

        // Test user assignment
        await taskHelper.assignTaskToUser(taskTitle, "developer@test.com");

        // Change status which should keep the assignment
        await taskHelper.changeTaskStatus(taskTitle, "doing");
        await taskHelper.changeTaskStatus(taskTitle, "done");

        // Cleanup
        await taskHelper.deleteTask(taskTitle);
        await storyHelper.deleteStory(storyName);
        await projectHelper.deleteProject(projectName);
    });
});

test.describe("Authentication", () => {
    test("Login and logout flow", async ({ page }) => {
        const authHelper = new AuthHelper(page);

        // Test login
        await authHelper.login();

        // Verify we're logged in
        await expect(page.getByText("Welcome back!")).toBeVisible();

        // Test logout
        await authHelper.logout();

        // Verify we're logged out
        await expect(page.getByText("Please log in to access your dashboard")).toBeVisible();
    });
});
