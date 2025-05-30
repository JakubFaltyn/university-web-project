"use client";

import * as React from "react";
import { CheckSquare, FileText, FolderOpen, Home, Settings, Plus, Loader2 } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { ProjectSwitcher } from "./project-switcher";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail, useSidebar } from "@/components/ui/sidebar";
import { NavUser } from "@features/users/nav-user";
import { NewProjectModal } from "@features/projects/new-project-modal";
import { useAppStore } from "@lib/store";
import { useTRPC } from "@/lib/trpc/context-provider";
import { useQuery } from "@tanstack/react-query";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { currentUser, activeProject, isInitialized, initializeApp } = useAppStore();
    const [showNewProjectModal, setShowNewProjectModal] = React.useState(false);
    const trpc = useTRPC();
    const hasInitialized = React.useRef(false);
    const { state } = useSidebar();

    // Fetch data for initialization
    const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery(trpc.users.getAll.queryOptions());
    const { data: projects = [], isLoading: projectsLoading, error: projectsError } = useQuery(trpc.projects.getAll.queryOptions());

    // Initialize app when data is available (only once)
    React.useEffect(() => {
        // Only initialize if we have valid data and haven't initialized yet
        if (
            !hasInitialized.current &&
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
            hasInitialized.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [users, projects, usersLoading, projectsLoading, usersError, projectsError]);

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
            url: activeProject ? `/projects/${activeProject.id}/stories` : "/stories",
            icon: FileText,
        },
        {
            title: "Tasks",
            url: activeProject ? `/projects/${activeProject.id}/tasks` : "/tasks",
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
                            <span className={state === "collapsed" ? "sr-only" : ""}>Add New Project</span>
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
