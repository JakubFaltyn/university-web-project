import mongoose, { Schema, Document } from "mongoose";
import { Task as TaskType } from "../types";

export interface ITask extends Omit<TaskType, "id">, Document {
    _id: string;
}

const TaskSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            required: true,
        },
        storyId: {
            type: Schema.Types.ObjectId,
            ref: "Story",
            required: true,
        },
        estimatedTime: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["todo", "doing", "done"],
            required: true,
        },
        createdAt: {
            type: String,
            required: true,
        },
        startDate: {
            type: String,
            required: false,
        },
        endDate: {
            type: String,
            required: false,
        },
        assignedUserId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const Task = mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;
