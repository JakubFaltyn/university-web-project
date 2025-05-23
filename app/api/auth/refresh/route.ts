import { NextResponse } from "next/server";
import { sign, verify } from "jsonwebtoken";

// Secret key for JWT (in a real app, this would be in an environment variable)
const JWT_SECRET = "your-secret-key";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
        }

        try {
            // Verify the refresh token
            const decoded = verify(refreshToken, JWT_SECRET) as { id: string };

            // In a real app, you would validate the token against a database
            // and check if it has been revoked

            // Generate new access token
            const token = sign({ id: decoded.id }, JWT_SECRET, { expiresIn: "1h" });

            return NextResponse.json({ token });
        } catch (error) {
            return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
        }
    } catch (error) {
        console.error("Refresh token error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
