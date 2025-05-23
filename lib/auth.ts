import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "./types";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role: string;
        };
    }

    interface User {
        id: string;
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role: string;
        id: string;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (account && user) {
                // This is the first time the user signs in
                token.id = user.id;
                token.role = "guest"; // Default role for OAuth users
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            if (account?.provider === "google") {
                // Allow all Google sign-ins
                return true;
            }
            return false;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
    session: {
        strategy: "jwt",
    },
};
