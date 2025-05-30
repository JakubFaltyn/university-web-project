import mongoose, { Schema, Document } from "mongoose";
import { Task as TaskType } from "@lib/types";

export interface ITask extends Document, Omit<TaskType, "id" | "storyId" | "assignedUserId"> {
    _id: mongoose.Types.ObjectId;
    storyId: mongoose.Types.ObjectId;
    assignedUserId?: mongoose.Types.ObjectId;
}

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false,
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
        required: true,
    },
    status: {
        type: String,
        enum: ["todo", "doing", "done"],
        default: "todo",
        required: true,
    },
    assignedUserId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    storyId: {
        type: Schema.Types.ObjectId,
        ref: "Story",
        required: true,
    },
    estimatedTime: {
        type: Number,
        required: true,
        min: 0.5,
    },
    startDate: {
        type: String,
        required: false,
    },
    endDate: {
        type: String,
        required: false,
    },
    createdAt: {
        type: String,
        required: true,
        default: () => new Date().toISOString(),
    },
});

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
