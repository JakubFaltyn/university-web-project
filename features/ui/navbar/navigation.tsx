"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@lib/store";
import { Button } from "@features/ui/button";
import { ThemeToggle } from "@features/ui/theme-toggle";
import { LogOut, LogIn } from "lucide-react";
import { useAuth } from "@features/auth/openauth-provider";
import { login, logout } from "@/app/actions";

export function Navigation() {
    const pathname = usePathname();
    const { activeProject } = useAppStore();
    const { user, isAuthenticated, isLoading } = useAuth();

    const routes = [
        {
            name: "Dashboard",
            path: "/",
            active: pathname === "/",
        },
        {
            name: "Projects",
            path: "/projects",
            active: pathname === "/projects",
        },
        {
            name: "Stories",
            path: "/stories",
            active: pathname === "/stories",
            disabled: !activeProject,
        },
        {
            name: "Tasks",
            path: "/tasks",
            active: pathname === "/tasks",
            disabled: !activeProject,
        },
    ];

    const handleSignOut = async () => {
        await logout();
    };

    const handleSignIn = async () => {
        await login();
    };

    return (
        <nav className="border-b">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-lg">ManagME</span>
                        </Link>
                        <div className="ml-10 flex space-x-4">
                            {routes.map((route) => (
                                <Link
                                    key={route.path}
                                    href={route.disabled ? "#" : route.path}
                                    className={`inline-flex items-center px-4 py-2 text-sm font-medium transition-colors ${
                                        route.active ? "border-b-2 border-primary text-foreground" : route.disabled ? "text-muted-foreground cursor-not-allowed" : "text-foreground hover:text-primary"
                                    }`}
                                    aria-disabled={route.disabled}
                                    onClick={(e) => {
                                        if (route.disabled) {
                                            e.preventDefault();
                                        }
                                    }}>
                                    {route.name}
                                    {route.disabled && route.name !== "Dashboard" && route.name !== "Projects" && <span className="ml-1 text-xs text-muted-foreground">(Select a project first)</span>}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isLoading ? (
                            <div className="text-sm text-muted-foreground">Loading...</div>
                        ) : isAuthenticated && user ? (
                            <div className="flex items-center gap-2">
                                <div className="text-sm">
                                    <span className="text-muted-foreground">Welcome, </span>
                                    <span className="font-medium">{user.name}</span>
                                    {user.role === "guest" && (
                                        <span className="ml-2 bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs font-medium">Guest (Read-only)</span>
                                    )}
                                </div>
                                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                                    <LogOut className="h-4 w-4" />
                                    <span className="sr-only">Sign out</span>
                                </Button>
                            </div>
                        ) : (
                            <Button variant="default" size="sm" onClick={handleSignIn}>
                                <LogIn className="h-4 w-4 mr-2" />
                                Sign in
                            </Button>
                        )}
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
