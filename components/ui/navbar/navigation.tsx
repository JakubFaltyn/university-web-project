"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@lib/store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogIn } from "lucide-react";

export function Navigation() {
    const pathname = usePathname();
    const { activeProject } = useAppStore();

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
                        <Button variant="default" size="sm">
                            <LogIn className="h-4 w-4 mr-2" />
                            Sign in
                        </Button>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </nav>
    );
}
