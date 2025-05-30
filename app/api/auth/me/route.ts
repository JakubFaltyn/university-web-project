import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/actions";

export async function GET(request: NextRequest) {
    try {
        const user = await auth();
        
        if (!user) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        return NextResponse.json(user.properties);
    } catch (error) {
        console.error("Error getting current user:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
} 