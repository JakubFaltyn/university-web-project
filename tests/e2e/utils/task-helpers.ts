import { Page, expect } from "@playwright/test";

export class TaskHelper {
    constructor(private page: Page) {}

    async createTask(title: string, description: string, storyName: string, priority: "low" | "medium" | "high" = "medium", estimatedTime: number = 8) {
        // Navigate to tasks section
        await this.page.click('[data-testid="tasks-nav"]');

        // Click create task button
        await this.page.click('[data-testid="create-task-button"]');

        // Fill task form
        await this.page.fill('[data-testid="task-title-input"]', title);
        await this.page.fill('[data-testid="task-description-input"]', description);
        await this.page.selectOption('[data-testid="task-story-select"]', storyName);
        await this.page.selectOption('[data-testid="task-priority-select"]', priority);
        await this.page.fill('[data-testid="task-estimated-time-input"]', estimatedTime.toString());

        // Submit form
        await this.page.click('[data-testid="submit-task-button"]');

        // Wait for task to be created and verify
        await expect(this.page.getByText(title)).toBeVisible();

        return { title, description, storyName, priority, estimatedTime };
    }

    async editTask(taskTitle: string, newTitle: string, newDescription: string, newPriority: "low" | "medium" | "high", newEstimatedTime: number) {
        // Find the task in the list
        const taskElement = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);

        // Click edit button for this task
        await taskElement.locator('[data-testid="edit-task-button"]').click();

        // Update task details
        await this.page.fill('[data-testid="task-title-input"]', newTitle);
        await this.page.fill('[data-testid="task-description-input"]', newDescription);
        await this.page.selectOption('[data-testid="task-priority-select"]', newPriority);
        await this.page.fill('[data-testid="task-estimated-time-input"]', newEstimatedTime.toString());

        // Submit changes
        await this.page.click('[data-testid="submit-task-button"]');

        // Verify changes
        await expect(this.page.getByText(newTitle)).toBeVisible();

        return { title: newTitle, description: newDescription, priority: newPriority, estimatedTime: newEstimatedTime };
    }

    async deleteTask(taskTitle: string) {
        // Find the task in the list
        const taskElement = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);

        // Click delete button for this task
        await taskElement.locator('[data-testid="delete-task-button"]').click();

        // Confirm deletion if there's a confirmation dialog
        await this.page.click('[data-testid="confirm-delete-button"]');

        // Verify task is removed
        await expect(this.page.getByText(taskTitle)).not.toBeVisible();
    }

    async changeTaskStatus(taskTitle: string, newStatus: "todo" | "doing" | "done", assignUserEmail?: string) {
        // Find the task in the list or kanban board
        const taskElement = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);

        // Click on the task to open details
        await taskElement.click();

        // If changing to 'doing' and user is provided, assign the user first
        if (newStatus === "doing" && assignUserEmail) {
            await this.page.selectOption('[data-testid="task-assignee-select"]', assignUserEmail);
        }

        // Change status
        await this.page.selectOption('[data-testid="task-status-select"]', newStatus);

        // Save changes
        await this.page.click('[data-testid="save-task-button"]');

        // Verify status change
        await expect(taskElement.locator(`[data-testid="task-status"]:has-text("${newStatus}")`)).toBeVisible();
    }

    async assignTaskToUser(taskTitle: string, userEmail: string) {
        // Find the task in the list
        const taskElement = this.page.locator(`[data-testid="task-item"]:has-text("${taskTitle}")`);

        // Click on the task to open details
        await taskElement.click();

        // Assign user
        await this.page.selectOption('[data-testid="task-assignee-select"]', userEmail);

        // Save changes
        await this.page.click('[data-testid="save-task-button"]');

        // Verify assignment
        await expect(taskElement.locator(`[data-testid="task-assignee"]:has-text("${userEmail}")`)).toBeVisible();
    }

    async verifyKanbanBoard() {
        // Navigate to kanban board view
        await this.page.click('[data-testid="kanban-view-button"]');

        // Verify kanban columns exist
        await expect(this.page.locator('[data-testid="kanban-todo-column"]')).toBeVisible();
        await expect(this.page.locator('[data-testid="kanban-doing-column"]')).toBeVisible();
        await expect(this.page.locator('[data-testid="kanban-done-column"]')).toBeVisible();
    }

    async moveTaskInKanban(taskTitle: string, fromColumn: string, toColumn: string) {
        // Navigate to kanban board view
        await this.page.click('[data-testid="kanban-view-button"]');

        // Find the task in the source column
        const taskElement = this.page.locator(`[data-testid="kanban-${fromColumn}-column"] [data-testid="task-card"]:has-text("${taskTitle}")`);

        // Drag task to target column
        const targetColumn = this.page.locator(`[data-testid="kanban-${toColumn}-column"]`);
        await taskElement.dragTo(targetColumn);

        // Verify task moved to new column
        await expect(this.page.locator(`[data-testid="kanban-${toColumn}-column"] [data-testid="task-card"]:has-text("${taskTitle}")`)).toBeVisible();
    }
}
