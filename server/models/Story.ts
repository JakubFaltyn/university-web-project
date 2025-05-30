import mongoose, { Schema, Document } from "mongoose";
import { Story as StoryType } from "@lib/types";

export interface IStory extends Omit<StoryType, "id">, Document {
    _id: string;
}

const StorySchema: Schema = new Schema(
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
        projectId: {
            type: Schema.Types.ObjectId,
            ref: "Project",
            required: true,
        },
        createdAt: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["todo", "doing", "done"],
            required: true,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        autoUpdateStatus: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

const Story = mongoose.models.Story || mongoose.model<IStory>("Story", StorySchema);
export default Story;
