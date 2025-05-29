"use client";

import { Bell, ChevronsUpDown, LogOut, Settings, User as UserIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@features/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@features/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@features/ui/sidebar";
import { useAppStore } from "@lib/store";
import { User } from "@lib/types"; 
export function NavUser({
    user,
}: {
    user: {
        name: string;
        email: string;
        avatar: string;
        role: string;
        id: string;
    };
}) {
    const { isMobile } = useSidebar();
    const { setCurrentUser } = useAppStore();

    // Fetch users using tRPC with API query options
    const { data: allUsers = [] } = trpc.users.getAll.useQuery(undefined, userQueries.all);

    // Filter out current user
    const users = allUsers.filter((u: User) => u.id !== user.id);

    const handleSwitchUser = async (switchUser: User) => {
        await setCurrentUser(switchUser);
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case "admin":
                return "text-red-600";
            case "developer":
                return "text-blue-600";
            case "devops":
                return "text-green-600";
            default:
                return "text-gray-600";
        }
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                            <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className={`truncate text-xs capitalize ${getRoleColor(user.role)}`}>{user.role}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg" side={isMobile ? "bottom" : "right"} align="end" sideOffset={4}>
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user.avatar} alt={user.name} />
                                    <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className={`truncate text-xs capitalize ${getRoleColor(user.role)}`}>{user.role}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <UserIcon />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">Switch User</DropdownMenuLabel>
                        {users.map((switchUser) => (
                            <DropdownMenuItem key={switchUser.id} onClick={() => handleSwitchUser(switchUser)} className="gap-2 p-2">
                                <Avatar className="h-6 w-6 rounded-md">
                                    <AvatarFallback className="rounded-md">{getInitials(`${switchUser.firstName} ${switchUser.lastName}`)}</AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">
                                        {switchUser.firstName} {switchUser.lastName}
                                    </span>
                                    <span className={`truncate text-xs capitalize ${getRoleColor(switchUser.role)}`}>{switchUser.role}</span>
                                </div>
                            </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
