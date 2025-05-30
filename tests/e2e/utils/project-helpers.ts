import { Page, expect } from "@playwright/test";

export class ProjectHelper {
    constructor(private page: Page) {}

    async createProject(name: string, description: string) {
        // Navigate to projects (assuming there's a navigation or projects page)
        await this.page.goto("/");

        // Click on Projects section or navigate to projects page
        await this.page.click('[data-testid="projects-nav"]');

        // Click create project button
        await this.page.click('[data-testid="create-project-button"]');

        // Fill project form
        await this.page.fill('[data-testid="project-name-input"]', name);
        await this.page.fill('[data-testid="project-description-input"]', description);

        // Submit form
        await this.page.click('[data-testid="submit-project-button"]');

        // Wait for project to be created and verify
        await expect(this.page.getByText(name)).toBeVisible();

        return { name, description };
    }

    async editProject(projectName: string, newName: string, newDescription: string) {
        // Find the project in the list
        const projectElement = this.page.locator(`[data-testid="project-item"]:has-text("${projectName}")`);

        // Click edit button for this project
        await projectElement.locator('[data-testid="edit-project-button"]').click();

        // Update project details
        await this.page.fill('[data-testid="project-name-input"]', newName);
        await this.page.fill('[data-testid="project-description-input"]', newDescription);

        // Submit changes
        await this.page.click('[data-testid="submit-project-button"]');

        // Verify changes
        await expect(this.page.getByText(newName)).toBeVisible();

        return { name: newName, description: newDescription };
    }

    async deleteProject(projectName: string) {
        // Find the project in the list
        const projectElement = this.page.locator(`[data-testid="project-item"]:has-text("${projectName}")`);

        // Click delete button for this project
        await projectElement.locator('[data-testid="delete-project-button"]').click();

        // Confirm deletion if there's a confirmation dialog
        await this.page.click('[data-testid="confirm-delete-button"]');

        // Verify project is removed
        await expect(this.page.getByText(projectName)).not.toBeVisible();
    }

    async selectProject(projectName: string) {
        const projectElement = this.page.locator(`[data-testid="project-item"]:has-text("${projectName}")`);
        await projectElement.click();

        // Verify we're on the project page
        await expect(this.page.getByText(projectName)).toBeVisible();
    }
}
