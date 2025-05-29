import mongoose, { Schema, Document } from "mongoose";
import { Project as ProjectType } from "../types";

export interface IProject extends Omit<ProjectType, "id">, Document {
    _id: string;
}

const ProjectSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        createdAt: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Project = mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
