"use client";

import * as React from "react";
import { CheckSquare, FileText, FolderOpen, Home, Users, Settings, Plus } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { NewProjectModal } from "@/components/new-project-modal";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { useAppStore } from "@/lib/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { currentUser, activeProject } = useAppStore();
    const [showNewProjectModal, setShowNewProjectModal] = React.useState(false);

    // Main navigation items for the project management app
    const navMain = [
        {
            title: "Dashboard",
            url: "/",
            icon: Home,
            isActive: true,
        },
        {
            title: "Stories",
            url: "/stories",
            icon: FileText,
        },
        {
            title: "Tasks",
            url: "/tasks",
            icon: CheckSquare,
        },
        {
            title: "Users",
            url: "/users",
            icon: Users,
            items: [
                {
                    title: "Team Members",
                    url: "/users",
                },
                {
                    title: "Roles & Permissions",
                    url: "/users/roles",
                },
            ],
        },
    ];

    // Project settings navigation (only show if there's an active project)
    const projectSettingsItems = activeProject
        ? [
              {
                  title: "Project Settings",
                  url: `/projects/${activeProject.id}/settings`,
                  icon: Settings,
              },
          ]
        : [];

    // User data for NavUser
    const userData = currentUser
        ? {
              name: `${currentUser.firstName} ${currentUser.lastName}`,
              email: currentUser.email || `${currentUser.firstName.toLowerCase()}@managme.com`,
              avatar: "", // We'll use initials instead
              role: currentUser.role,
              id: currentUser.id,
          }
        : null;

    // Team data for TeamSwitcher (representing the current project)
    const teamData = activeProject
        ? [
              {
                  name: activeProject.name,
                  logo: FolderOpen,
                  plan: `Active Project`,
                  id: activeProject.id,
              },
          ]
        : [
              {
                  name: "ManagME",
                  logo: Settings,
                  plan: "No Active Project",
                  id: "",
              },
          ];

    return (
        <>
            <Sidebar collapsible="icon" {...props}>
                <SidebarHeader>
                    <TeamSwitcher teams={teamData} />
                    <div className="px-2 py-2">
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setShowNewProjectModal(true)}>
                            <Plus className="h-4 w-4" />
                            Add New Project
                        </Button>
                    </div>
                </SidebarHeader>
                <SidebarContent>
                    <NavMain items={navMain} />
                    {projectSettingsItems.length > 0 && (
                        <div className="mt-auto">
                            <NavSecondary items={projectSettingsItems} title="Project Settings" className="mt-auto" />
                        </div>
                    )}
                </SidebarContent>
                <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <NewProjectModal open={showNewProjectModal} onOpenChange={setShowNewProjectModal} />
        </>
    );
}
