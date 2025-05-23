import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";

// Secret key for JWT (in a real app, this would be in an environment variable)
const JWT_SECRET = "your-secret-key";

// Mock users database (in a real app, this would be a database query)
const users = [
    {
        id: "1",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        email: "admin@example.com",
    },
    {
        id: "2",
        firstName: "Dev",
        lastName: "User",
        role: "developer",
        email: "dev@example.com",
    },
    {
        id: "3",
        firstName: "DevOps",
        lastName: "User",
        role: "devops",
        email: "devops@example.com",
    },
];

export async function GET(request: Request) {
    try {
        // Get the authorization header
        const authHeader = request.headers.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Authorization header is required" }, { status: 401 });
        }

        // Extract the token
        const token = authHeader.split(" ")[1];

        try {
            // Verify the token
            const decoded = verify(token, JWT_SECRET) as { id: string };

            // Find the user
            const user = users.find((u) => u.id === decoded.id);

            if (!user) {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }

            // Return the user data (without password)
            return NextResponse.json({
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    email: user.email,
                },
            });
        } catch (error) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
    } catch (error) {
        console.error("Get user error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
