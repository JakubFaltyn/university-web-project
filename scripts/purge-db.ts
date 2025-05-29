#!/usr/bin/env tsx

import mongoose from "mongoose";
import connectDB from "../server/mongodb";
import User from "../server/models/User";
import Project from "../server/models/Project";
import Story from "../server/models/Story";
import Task from "../server/models/Task";
import { autoSeedDatabase } from "../server/utils/auto-seed";

async function purgeDatabase(reseed: boolean = false) {
    try {
        console.log("🔗 Connecting to database...");
        await connectDB();

        console.log("🗑️  Purging database...");

        // Delete all data from collections
        const deletePromises = [Task.deleteMany({}), Story.deleteMany({}), Project.deleteMany({}), User.deleteMany({})];

        const results = await Promise.all(deletePromises);

        console.log("✅ Database purged successfully!");
        console.log(`   - Deleted ${results[3].deletedCount} users`);
        console.log(`   - Deleted ${results[2].deletedCount} projects`);
        console.log(`   - Deleted ${results[1].deletedCount} stories`);
        console.log(`   - Deleted ${results[0].deletedCount} tasks`);

        if (reseed) {
            console.log("\n🌱 Re-seeding database...");
            await autoSeedDatabase();
        }

        console.log("\n🎉 Operation completed successfully!");
    } catch (error) {
        console.error("❌ Error during database operation:", error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const shouldReseed = args.includes("--reseed") || args.includes("-r");

// Show help
if (args.includes("--help") || args.includes("-h")) {
    console.log(`
🗑️  Database Purge Script

Usage: pnpm purge-db [options]

Options:
  --reseed, -r    Re-seed the database with default data after purging
  --help, -h      Show this help message

Examples:
  pnpm purge-db           # Just purge the database
  pnpm purge-db --reseed  # Purge and re-seed with default data
`);
    process.exit(0);
}

console.log("🚨 WARNING: This will delete ALL data from the database!");
if (shouldReseed) {
    console.log("📝 Database will be re-seeded with default data after purging.");
}
console.log("\nStarting in 3 seconds... Press Ctrl+C to cancel");

setTimeout(() => {
    purgeDatabase(shouldReseed);
}, 3000);
