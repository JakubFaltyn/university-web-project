import { Page, expect } from "@playwright/test";

export class StoryHelper {
    constructor(private page: Page) {}

    async createStory(name: string, description: string, priority: "low" | "medium" | "high" = "medium") {
        // Navigate to stories section
        await this.page.click('[data-testid="stories-nav"]');

        // Click create story button
        await this.page.click('[data-testid="create-story-button"]');

        // Fill story form
        await this.page.fill('[data-testid="story-name-input"]', name);
        await this.page.fill('[data-testid="story-description-input"]', description);
        await this.page.selectOption('[data-testid="story-priority-select"]', priority);

        // Submit form
        await this.page.click('[data-testid="submit-story-button"]');

        // Wait for story to be created and verify
        await expect(this.page.getByText(name)).toBeVisible();

        return { name, description, priority };
    }

    async editStory(storyName: string, newName: string, newDescription: string, newPriority: "low" | "medium" | "high") {
        // Find the story in the list
        const storyElement = this.page.locator(`[data-testid="story-item"]:has-text("${storyName}")`);

        // Click edit button for this story
        await storyElement.locator('[data-testid="edit-story-button"]').click();

        // Update story details
        await this.page.fill('[data-testid="story-name-input"]', newName);
        await this.page.fill('[data-testid="story-description-input"]', newDescription);
        await this.page.selectOption('[data-testid="story-priority-select"]', newPriority);

        // Submit changes
        await this.page.click('[data-testid="submit-story-button"]');

        // Verify changes
        await expect(this.page.getByText(newName)).toBeVisible();

        return { name: newName, description: newDescription, priority: newPriority };
    }

    async deleteStory(storyName: string) {
        // Find the story in the list
        const storyElement = this.page.locator(`[data-testid="story-item"]:has-text("${storyName}")`);

        // Click delete button for this story
        await storyElement.locator('[data-testid="delete-story-button"]').click();

        // Confirm deletion if there's a confirmation dialog
        await this.page.click('[data-testid="confirm-delete-button"]');

        // Verify story is removed
        await expect(this.page.getByText(storyName)).not.toBeVisible();
    }

    async changeStoryStatus(storyName: string, newStatus: "todo" | "doing" | "done") {
        // Find the story in the list
        const storyElement = this.page.locator(`[data-testid="story-item"]:has-text("${storyName}")`);

        // Click on the story to open details or edit
        await storyElement.click();

        // Change status
        await this.page.selectOption('[data-testid="story-status-select"]', newStatus);

        // Save changes
        await this.page.click('[data-testid="save-story-button"]');

        // Verify status change
        await expect(storyElement.locator(`[data-testid="story-status"]:has-text("${newStatus}")`)).toBeVisible();
    }
}
