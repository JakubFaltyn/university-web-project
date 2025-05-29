# OpenAuth Setup Guide

This project now uses OpenAuth instead of NextAuth for authentication. Follow these steps to set up the OpenAuth server.

## Prerequisites

-   Node.js 18+ installed
-   pnpm package manager

## Setting up OpenAuth Server

1. **Create a new directory for the auth server:**

    ```bash
    mkdir openauth-server
    cd openauth-server
    ```

2. **Initialize a new Node.js project:**

    ```bash
    npm init -y
    ```

3. **Install OpenAuth server dependencies:**

    ```bash
    npm install @openauthjs/openauth
    ```

4. **Create the auth server (index.js):**

    ```javascript
    import { createServer } from "@openauthjs/openauth"
    import { GoogleProvider } from "@openauthjs/openauth/provider/google"

    const server = createServer({
      issuer: "http://localhost:3001",
      providers: {
        google: GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      },
      subjects: {
        user: {
          id: "string",
          email: "string",
          name: "string",
          role: "string",
        },
      },
      success: async (ctx, { subject, claims }) => {
        // Set default role for OAuth users
        return {
          ...subject,
          user: {
            ...subject.user,
            role: "guest", // Default role for OAuth users
          },
        }
      },
    })

    server.listen(3001, () => {
      console.log("OpenAuth server running on http://localhost:3001")
    })
    ```

5. **Create environment file (.env):**

    ```
    GOOGLE_CLIENT_ID=your_google_client_id
    GOOGLE_CLIENT_SECRET=your_google_client_secret
    ```

6. **Update package.json to use ES modules:**

    ```json
    {
      "type": "module",
      "scripts": {
        "start": "node index.js",
        "dev": "node --watch index.js"
      }
    }
    ```

7. **Start the auth server:**
    ```bash
    npm run dev
    ```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
5. Set authorized redirect URIs to: `http://localhost:3001/callback/google`
6. Copy the Client ID and Client Secret to your auth server's .env file

## Running the Application

1. **Start the OpenAuth server (port 3001):**

    ```bash
    cd openauth-server
    npm run dev
    ```

2. **Start your Next.js application (port 3000):**

    ```bash
    cd your-nextjs-app
    pnpm dev
    ```

3. **Access your application:**
    - Next.js app: http://localhost:3000
    - OpenAuth server: http://localhost:3001

## Features

-   ✅ Google OAuth authentication
-   ✅ JWT token management with refresh tokens
-   ✅ Automatic role assignment (OAuth users get "guest" role)
-   ✅ Secure HTTP-only cookies
-   ✅ Seamless integration with existing tRPC setup
-   ✅ Backward compatibility with local user system

## Migration Notes

-   Removed NextAuth dependency completely
-   All authentication now goes through OpenAuth
-   OAuth users automatically get "guest" role (read-only access)
-   Local user system still works for development/testing
-   Environment variables updated (removed NEXTAUTH\_\* variables)
