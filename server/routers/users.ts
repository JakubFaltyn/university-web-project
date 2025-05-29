import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import User, { type IUser } from "../models/User";

// Input schemas
const createUserSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    role: z.enum(["admin", "user", "manager"]),
    defaultProjectId: z.string().optional(),
});

const updateUserSchema = createUserSchema.partial().extend({
    id: z.string(),
});

// Helper function to format user
const formatUser = (user: IUser) => ({
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    email: user.email,
    defaultProjectId: user.defaultProjectId?.toString(),
});

export const usersRouter = router({
    // Get all users
    getAll: publicProcedure.query(async () => {
        try {
            const users = await User.find({});
            return users.map(formatUser);
        } catch (error) {
            console.error("Error fetching users:", error);
            throw new Error("Failed to fetch users");
        }
    }),

    // Get single user by ID
    getById: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input }) => {
            try {
                const user = await User.findById(input.id);
                if (!user) {
                    throw new Error("User not found");
                }
                return formatUser(user);
            } catch (error) {
                console.error("Error fetching user:", error);
                throw new Error("Failed to fetch user");
            }
        }),

    // Create new user
    create: publicProcedure.input(createUserSchema).mutation(async ({ input }) => {
        try {
            const user = new User(input);
            await user.save();
            return formatUser(user);
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error("Failed to create user");
        }
    }),

    // Update user
    update: publicProcedure.input(updateUserSchema).mutation(async ({ input }) => {
        try {
            const { id, ...updateData } = input;
            const user = await User.findByIdAndUpdate(id, updateData, { new: true });

            if (!user) {
                throw new Error("User not found");
            }

            return formatUser(user);
        } catch (error) {
            console.error("Error updating user:", error);
            throw new Error("Failed to update user");
        }
    }),

    // Delete user
    delete: publicProcedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .mutation(async ({ input }) => {
            try {
                const user = await User.findByIdAndDelete(input.id);

                if (!user) {
                    throw new Error("User not found");
                }

                return { success: true };
            } catch (error) {
                console.error("Error deleting user:", error);
                throw new Error("Failed to delete user");
            }
        }),
});
