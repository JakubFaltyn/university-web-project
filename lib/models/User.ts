import mongoose, { Schema, Document } from "mongoose";
import { User as UserType } from "../types";

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
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
