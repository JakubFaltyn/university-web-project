import { useEffect, useState } from "react";
import { useAppStore } from "@lib/store";

interface CurrentUser {
    id: string;
    email?: string;
    name: string;
    firstName: string;
    lastName: string;
    role: string;
}

export function useCurrentUser(): CurrentUser | null {
    const { currentUser } = useAppStore();
    const [authUser, setAuthUser] = useState<any>(null);

    // Get OAuth user from server
    useEffect(() => {
        async function fetchAuthUser() {
            try {
                const response = await fetch("/api/auth/me");
                if (response.ok) {
                    const user = await response.json();
                    setAuthUser(user);
                }
            } catch (error) {
                console.log("No OAuth user found, using local user");
            }
        }

        fetchAuthUser();
    }, []);

    // Return OAuth user if available, otherwise local user
    if (authUser && authUser.id) {
        return {
            id: authUser.id,
            email: authUser.email,
            name: authUser.name || "OAuth User",
            firstName: authUser.name?.split(" ")[0] || "OAuth",
            lastName: authUser.name?.split(" ").slice(1).join(" ") || "User",
            role: authUser.role || "guest",
        };
    }

    if (currentUser) {
        return {
            id: currentUser.id,
            email: currentUser.email,
            name: `${currentUser.firstName} ${currentUser.lastName}`,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            role: currentUser.role,
        };
    }

    return null;
}
