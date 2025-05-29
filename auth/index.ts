import { issuer } from "@openauthjs/openauth";
import { GoogleProvider } from "@openauthjs/openauth/provider/google";
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

            const userInfo = await userInfoResponse.json();
            const userId = await getUser(userInfo.email || "unknown@example.com");

            return ctx.subject("user", {
                id: userId,
                email: userInfo.email || "unknown@example.com",
                name: userInfo.name || userInfo.email || "Unknown User",
                role: "guest", // Default role for OAuth users
            });
        }

        throw new Error("Invalid provider");
    },
});
