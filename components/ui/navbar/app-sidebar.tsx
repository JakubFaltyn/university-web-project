"use client";

import * as React from "react";
import { CheckSquare, FileText, FolderOpen, Home, Settings, Plus, Loader2 } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { ProjectSwitcher } from "./project-switcher";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavUser } from "@features/users/nav-user";
import { NewProjectModal } from "@features/projects/new-project-modal";
import { useAppStore } from "@lib/store";
import { trpc } from "@/lib/trpc";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { currentUser, activeProject, isInitialized, initializeApp } = useAppStore();
    const [showNewProjectModal, setShowNewProjectModal] = React.useState(false);

    // Fetch data for initialization
    const { data: users = [], isLoading: usersLoading, error: usersError } = trpc.users.getAll.useQuery();
    const { data: projects = [], isLoading: projectsLoading, error: projectsError } = trpc.projects.getAll.useQuery();

    // Initialize app when data is available
    React.useEffect(() => {
        // Only initialize if we have valid data and haven't initialized yet
        if (
            !isInitialized &&
            !usersLoading &&
            !projectsLoading &&
            !usersError &&
            !projectsError &&
            users &&
            Array.isArray(users) &&
            users.length > 0 &&
            projects &&
            Array.isArray(projects) &&
            projects.length > 0
        ) {
            console.log("Initializing app with:", { usersCount: users.length, projectsCount: projects.length });
            initializeApp(users, projects);
        }
    }, [users, projects, isInitialized, initializeApp, usersLoading, projectsLoading, usersError, projectsError]);

    const isLoading = usersLoading || projectsLoading || !isInitialized;

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

    // User data for NavUser - always show, even if no current user
    const userData = currentUser
        ? {
              name: `${currentUser.firstName} ${currentUser.lastName}`,
              email: currentUser.email || `${currentUser.firstName.toLowerCase()}@managme.com`,
              avatar: "", // We'll use initials instead
              role: currentUser.role,
              id: currentUser.id,
          }
        : {
              name: isLoading ? "Loading..." : "Select User",
              email: isLoading ? "Initializing..." : "No user selected",
              avatar: "",
              role: "guest",
              id: "",
          };

    // Project data for ProjectSwitcher (representing the current project)
    const projectData = activeProject
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
                  name: isLoading ? "Loading..." : "ManagME",
                  logo: isLoading ? Loader2 : Settings,
                  plan: isLoading ? "Initializing..." : "No Active Project",
                  id: "",
              },
          ];

    return (
        <>
            <Sidebar collapsible="icon" {...props}>
                <SidebarHeader>
                    <ProjectSwitcher defaultProjects={projectData} />
                    <div className="px-2 py-2">
                        <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => setShowNewProjectModal(true)} disabled={isLoading}>
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
                <SidebarFooter>
                    <NavUser user={userData} />
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            <NewProjectModal open={showNewProjectModal} onOpenChange={setShowNewProjectModal} />
        </>
    );
}
