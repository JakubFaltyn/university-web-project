import mongoose, { Schema, Document } from "mongoose";
import { User as UserType } from "@lib/types";

export interface IUser extends Omit<UserType, "id">, Document {
    _id: string;
}

const UserSchema: Schema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "devops", "developer", "guest"],
            required: true,
        },
        email: {
            type: String,
            required: false,
        },
        defaultProjectId: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
