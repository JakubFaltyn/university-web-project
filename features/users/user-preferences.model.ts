import mongoose, { Schema, Document } from "mongoose";

export interface IUserPreferences extends Document {
    userId: string;
    activeProjectId?: string;
    sessionToken?: string;
    lastActivity: Date;
}

const UserPreferencesSchema: Schema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        activeProjectId: {
            type: String,
            required: false,
        },
        sessionToken: {
            type: String,
            required: false,
        },
        lastActivity: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

export const UserPreferencesModel = mongoose.models.UserPreferences || mongoose.model<IUserPreferences>("UserPreferences", UserPreferencesSchema);
