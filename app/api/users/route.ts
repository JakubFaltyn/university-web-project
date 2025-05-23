import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function GET() {
    try {
        await connectDB();
        const users = await User.find({});

        // Convert MongoDB documents to our format
        const formattedUsers = users.map((user) => ({
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email,
        }));

        return NextResponse.json(formattedUsers);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();

        const user = new User(body);
        await user.save();

        // Convert to our format
        const formattedUser = {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            email: user.email,
        };

        return NextResponse.json(formattedUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }
}
