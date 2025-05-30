"use client";

import { useAppStore } from "@lib/store";
import { useState } from "react";
import { User, UserRole } from "@lib/types";
import { Button } from "@/components/ui/button";
import { isReadOnly } from "@lib/permissions";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useQuery } from "@tanstack/react-query";

interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface UserInfoProps {
    authUser?: AuthUser | null;
}

export function UserInfo({ authUser }: UserInfoProps) {
    const { currentUser, setCurrentUser } = useAppStore();
    const [showUserSelector, setShowUserSelector] = useState(false);

    const trpc = useTRPC();

    // Fetch users using tRPC
    const { data: users = [] } = useQuery(trpc.users.getAll.queryOptions());

    const handleUserChange = (user: User) => {
        setCurrentUser(user);
        setShowUserSelector(false);
    };

    const getUserRoleLabel = (role: UserRole) => {
        switch (role) {
            case "admin":
                return <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 px-2 py-0.5 rounded-full text-xs font-medium">Admin</span>;
            case "developer":
                return <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-medium">Developer</span>;
            case "devops":
                return <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">DevOps</span>;
            case "guest":
                return <span className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">Guest</span>;
        }
    };

    // If user is logged in via OpenAuth, show OAuth user info
    if (authUser) {
        const oauthUser = {
            id: authUser.id,
            firstName: authUser.name?.split(" ")[0] || "OAuth",
            lastName: authUser.name?.split(" ").slice(1).join(" ") || "User",
            role: authUser.role as UserRole,
            email: authUser.email || undefined,
        };

        return (
            <div className="border rounded-lg p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center font-medium">
                        {oauthUser.firstName[0]}
                        {oauthUser.lastName[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-medium">
                                {oauthUser.firstName} {oauthUser.lastName}
                            </p>
                            {getUserRoleLabel(oauthUser.role)}
                            <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-medium">OAuth</span>
                        </div>
                        {oauthUser.email && <p className="text-sm text-muted-foreground">{oauthUser.email}</p>}
                        {isReadOnly(oauthUser.role) && <p className="text-xs text-muted-foreground mt-1">Read-only access</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Signed in with OpenAuth</span>
                </div>
            </div>
        );
    }

    // Local user selection (when not using OAuth)
    if (!currentUser) {
        return (
            <div className="border rounded-lg p-4 flex justify-between items-center">
                <div>
                    <p className="font-medium">Not logged in</p>
                    <p className="text-sm text-muted-foreground">Please select a user or sign in</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => setShowUserSelector(true)}>
                        Select User
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="border rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
                <div className="bg-primary/10 text-primary rounded-full w-10 h-10 flex items-center justify-center font-medium">
                    {currentUser.firstName[0]}
                    {currentUser.lastName[0]}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <p className="font-medium">
                            {currentUser.firstName} {currentUser.lastName}
                        </p>
                        {getUserRoleLabel(currentUser.role)}
                        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs font-medium">Local</span>
                    </div>
                    {currentUser.email && <p className="text-sm text-muted-foreground">{currentUser.email}</p>}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowUserSelector(!showUserSelector)}>
                    Switch User
                </Button>
            </div>

            {showUserSelector && (
                <div className="absolute mt-2 right-4 top-20 w-64 bg-background border rounded-lg shadow-lg overflow-hidden z-10">
                    <div className="p-2 border-b">
                        <p className="font-medium">Select Local User</p>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {users.map((user: User) => (
                            <button
                                key={user.id}
                                className={`w-full text-left px-4 py-2 hover:bg-muted flex items-center justify-between ${currentUser?.id === user.id ? "bg-muted" : ""}`}
                                onClick={() => handleUserChange(user)}>
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                                        {user.firstName[0]}
                                        {user.lastName[0]}
                                    </div>
                                    <span>
                                        {user.firstName} {user.lastName}
                                    </span>
                                </div>
                                {getUserRoleLabel(user.role)}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
