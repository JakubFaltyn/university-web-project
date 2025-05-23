import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

// In a real application, this would be stored in a database
const users = [
    {
        id: "1",
        username: "admin",
        password: "admin123",
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        email: "admin@example.com",
    },
    {
        id: "2",
        username: "dev",
        password: "dev123",
        firstName: "Dev",
        lastName: "User",
        role: "developer",
        email: "dev@example.com",
    },
    {
        id: "3",
        username: "devops",
        password: "devops123",
        firstName: "DevOps",
        lastName: "User",
        role: "devops",
        email: "devops@example.com",
    },
];

// Secret key for JWT (in a real app, this would be in an environment variable)
const JWT_SECRET = "your-secret-key";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Find user
        const user = users.find((u) => u.username === username && u.password === password);

        if (!user) {
            return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
        }

        // Generate JWT token
        const token = sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Generate refresh token (in a real app, this would be stored in a database)
        const refreshToken = sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });

        // Return user data and tokens
        return NextResponse.json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                email: user.email,
            },
            token,
            refreshToken,
        });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
