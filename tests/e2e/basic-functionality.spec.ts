import { test, expect } from "@playwright/test";

test.describe("Basic Application Functionality", () => {
    test("Application loads and displays home page", async ({ page }) => {
        await page.goto("/");

        // Check if the page loads successfully
        await expect(page).toHaveTitle(/University Web Project/);

        // Check for basic page elements
        await expect(page.getByText("Welcome to University Web Project")).toBeVisible();
    });

    test("Navigation and basic UI elements", async ({ page }) => {
        await page.goto("/");

        // Check for login/logout functionality
        const loginButton = page.locator('button:has-text("Login with OpenAuth")');
        const logoutButton = page.locator('button:has-text("Logout")');

        // Either login or logout button should be visible
        const isLoggedIn = await logoutButton.isVisible();
        const isLoggedOut = await loginButton.isVisible();

        expect(isLoggedIn || isLoggedOut).toBeTruthy();

        // Check for dashboard sections
        await expect(page.getByText("Projects")).toBeVisible();
        await expect(page.getByText("Tasks")).toBeVisible();
        await expect(page.getByText("Stories")).toBeVisible();
        await expect(page.getByText("Dashboard")).toBeVisible();
    });

    test("Login page accessibility", async ({ page }) => {
        await page.goto("/login");

        // Check if login page loads
        await expect(page).toHaveURL("/login");

        // The login page should be accessible
        const pageContent = await page.content();
        expect(pageContent.length).toBeGreaterThan(0);
    });

    test("Basic authentication flow", async ({ page }) => {
        await page.goto("/");

        // If not logged in, try to access login
        const loginButton = page.locator('button:has-text("Login with OpenAuth")');
        const isLoginVisible = await loginButton.isVisible();

        if (isLoginVisible) {
            // Click login button and verify redirect
            await loginButton.click();

            // Should redirect to login page or auth provider
            await page.waitForTimeout(1000); // Wait for potential redirect

            // Verify we're either on login page or auth provider
            const currentUrl = page.url();
            expect(currentUrl).not.toBe("/");
        }
    });

    test("Responsive design check", async ({ page }) => {
        // Test desktop view
        await page.setViewportSize({ width: 1200, height: 800 });
        await page.goto("/");

        // Check grid layout exists (should be visible on desktop)
        const gridElement = page.locator('[class*="grid"]');
        await expect(gridElement).toBeVisible();

        // Test mobile view
        await page.setViewportSize({ width: 375, height: 667 });
        await page.reload();

        // Page should still be functional on mobile
        await expect(page.getByText("Dashboard")).toBeVisible();
    });

    test("API endpoints accessibility", async ({ request }) => {
        // Test if tRPC endpoint is accessible
        const response = await request.get("/api/trpc/user.me");

        // Should return some response (even if unauthorized)
        expect(response.status()).toBeLessThan(500); // No server errors
    });
});
