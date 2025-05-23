"use client";

import * as React from "react";
import { ChevronsUpDown, FolderOpen, Settings } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/store";

export function TeamSwitcher({
    teams,
}: {
    teams: {
        name: string;
        logo: React.ElementType;
        plan: string;
        id: string;
    }[];
}) {
    const { isMobile } = useSidebar();
    const { projects, activeProject, setActiveProject } = useAppStore();

    const handleSetActiveProject = async (projectId: string) => {
        if (projectId) {
            await setActiveProject(projectId);
        }
    };

    // Use the active project or fallback to the default team data
    const displayTeam = activeProject
        ? {
              name: activeProject.name,
              logo: FolderOpen,
              plan: "Active Project",
              id: activeProject.id,
          }
        : teams[0];

    if (!displayTeam) {
        return null;
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                <displayTeam.logo className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{displayTeam.name}</span>
                                <span className="truncate text-xs">{displayTeam.plan}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" align="start" side={isMobile ? "bottom" : "right"} sideOffset={4}>
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Project</DropdownMenuLabel>
                        {projects.map((project, index) => (
                            <DropdownMenuItem key={project.id} onClick={() => handleSetActiveProject(project.id)} className="gap-2 p-2">
                                <div className="flex size-6 items-center justify-center rounded-sm border">
                                    <FolderOpen className="size-4 shrink-0" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{project.name}</span>
                                    <span className="truncate text-xs text-muted-foreground">{project.description || "No description"}</span>
                                </div>
                                {activeProject?.id === project.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                            </DropdownMenuItem>
                        ))}
                        {projects.length === 0 && (
                            <DropdownMenuItem disabled>
                                <div className="text-muted-foreground">No projects found</div>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
