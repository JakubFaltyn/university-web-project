import { issuer } from "@openauthjs/openauth";
import { GoogleProvider } from "@openauthjs/openauth/provider/google";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import { subjects } from "./subjects";

async function getUser(email: string) {
    // Get user from database and return user ID
    // For now, return a mock user ID based on email
    return email.split("@")[0] + "_" + Date.now().toString().slice(-6);
}

export default issuer({
    subjects,
    storage: MemoryStorage(),
    providers: {
        google: GoogleProvider({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scopes: ["openid", "email", "profile"],
        }),
        password: PasswordProvider(
            PasswordUI({
                copy: {
                    login_title: "Welcome to ManagME",
                    login_description: "Sign in to access your project management dashboard",
                    register_title: "Join ManagME",
                    register_description: "Create your account to get started",
                    error_email_taken: "An account with this email already exists",
                    error_invalid_password: "Invalid email or password",
                    error_invalid_email: "Please enter a valid email address",
                },
                validatePassword: (password) => {
                    if (password.length < 8) {
                        return "Password must be at least 8 characters long";
                    }
                    return undefined;
                },
                sendCode: async (email, code) => {
                    console.log(email, code);
                },
            })
        ),
    },
    success: async (ctx, value) => {
        // Handle Google OAuth
        if (value.provider === "google") {
            // For Google OAuth, we need to get user info from the access token
            // The tokenset contains the access token we can use to fetch user info
            const accessToken = value.tokenset.access;

            // Fetch user info from Google's userinfo endpoint
            const userInfoResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!userInfoResponse.ok) {
                throw new Error("Failed to fetch user info from Google");
            }

            const userInfo = (await userInfoResponse.json()) as {
                email?: string;
                name?: string;
                given_name?: string;
                family_name?: string;
                picture?: string;
            };
            const userId = await getUser(userInfo.email || "unknown@example.com");

            return ctx.subject("user", {
                id: userId,
                email: userInfo.email || "unknown@example.com",
                name: userInfo.name || userInfo.email || "Unknown User",
                role: "guest", // Default role for OAuth users
            });
        }

        // Handle Password authentication
        if (value.provider === "password") {
            const email = value.email;
            const userId = await getUser(email);

            return ctx.subject("user", {
                id: userId,
                email: email,
                name: email.split("@")[0], // Use email prefix as name
                role: "guest", // Default role for password users
            });
        }

        throw new Error("Invalid provider");
    },
});
