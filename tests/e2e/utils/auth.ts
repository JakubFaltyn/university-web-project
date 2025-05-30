import { Page, expect } from "@playwright/test";

export class AuthHelper {
    constructor(private page: Page) {}

    async login(email: string = "admin@test.com", password: string = "admin123") {
        await this.page.goto("/login");

        // Fill login form
        await this.page.fill('[data-testid="email-input"]', email);
        await this.page.fill('[data-testid="password-input"]', password);

        // Submit login
        await this.page.click('[data-testid="login-button"]');

        // Wait for redirect to dashboard
        await this.page.waitForURL("/");

        // Verify login success by checking for logout button or user info
        await expect(this.page.getByText("Welcome back!")).toBeVisible();
    }

    async logout() {
        await this.page.click('button:has-text("Logout")');
        await this.page.waitForURL("/");
        await expect(this.page.getByText("Please log in to access your dashboard")).toBeVisible();
    }

    async ensureLoggedIn() {
        // Check if already logged in
        const logoutButton = this.page.locator('button:has-text("Logout")');
        const isLoggedIn = await logoutButton.isVisible();

        if (!isLoggedIn) {
            await this.login();
        }
    }
}
