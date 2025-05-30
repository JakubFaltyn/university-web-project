# Default Accounts

The application comes with predefined accounts for testing and administration purposes.

## Login Credentials

### Admin Account

-   **Email:** `admin@managme.com`
-   **Password:** `admin123456`
-   **Role:** Admin (Full access)
-   **Permissions:** Create, read, update, delete everything

### Developer Account

-   **Email:** `developer@managme.com`
-   **Password:** `dev123456`
-   **Role:** Developer (Development access)
-   **Permissions:** Manage projects, tasks, and development resources

### DevOps Account

-   **Email:** `devops@managme.com`
-   **Password:** `devops123456`
-   **Role:** DevOps (Infrastructure access)
-   **Permissions:** Manage deployments, infrastructure, and system operations

### Guest Account

-   **Email:** `guest@managme.com`
-   **Password:** `guest123456`
-   **Role:** Guest (Read-only access)
-   **Permissions:** View-only access to projects and tasks

## Google OAuth Users

Users who login with Google will automatically receive **Guest** role with read-only permissions.

## Password Users

New users who register with email/password will receive **Guest** role by default.

## Authentication URLs

-   **Password Login:** `http://localhost:3001/authorize/password`
-   **Google OAuth:** `http://localhost:3001/authorize/google`

---

**Note:** In production, these default passwords should be changed and properly hashed.
