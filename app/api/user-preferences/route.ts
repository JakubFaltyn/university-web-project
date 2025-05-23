import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import UserPreferences from "@/lib/models/UserPreferences";

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        let preferences = await UserPreferences.findOne({ userId });

        if (!preferences) {
            // Create default preferences if none exist
            preferences = new UserPreferences({ userId });
            await preferences.save();
        }

        return NextResponse.json({
            userId: preferences.userId,
            activeProjectId: preferences.activeProjectId,
            lastActivity: preferences.lastActivity,
        });
    } catch (error) {
        console.error("Error fetching user preferences:", error);
        return NextResponse.json({ error: "Failed to fetch user preferences" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { userId, activeProjectId } = body;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        let preferences = await UserPreferences.findOne({ userId });

        if (!preferences) {
            preferences = new UserPreferences({
                userId,
                activeProjectId,
                lastActivity: new Date(),
            });
        } else {
            preferences.activeProjectId = activeProjectId;
            preferences.lastActivity = new Date();
        }

        await preferences.save();

        return NextResponse.json({
            userId: preferences.userId,
            activeProjectId: preferences.activeProjectId,
            lastActivity: preferences.lastActivity,
        });
    } catch (error) {
        console.error("Error updating user preferences:", error);
        return NextResponse.json({ error: "Failed to update user preferences" }, { status: 500 });
    }
}
