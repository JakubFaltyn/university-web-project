import mongoose from "mongoose";

interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongooseCache;

if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}

async function connectDB() {
    if (cached!.conn) {
        return cached!.conn;
    }

    if (!cached!.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 5, // Maintain a minimum of 5 socket connections
        };

        cached!.promise = mongoose.connect(MONGODB_URI!, opts);
    }

    try {
        cached!.conn = await cached!.promise;
        console.log("Connected to MongoDB Atlas successfully");
    } catch (e) {
        cached!.promise = null;
        console.error("MongoDB Atlas connection error:", e);

        // In development, provide helpful error message
        if (process.env.NODE_ENV === "development") {
            console.log("\n🔧 Development Setup Help:");
            console.log("1. Check if your IP is whitelisted in MongoDB Atlas");
            console.log("2. Verify your MongoDB connection string in .env.local");
            console.log("3. Consider using a local MongoDB instance for development");
            console.log("4. You can initialize sample data using the /api/trpc/init.initializeDatabase endpoint\n");
        }

        throw e;
    }

    return cached!.conn;
}

export default connectDB;
