"use client";

import { usePathname } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export function DynamicBreadcrumb() {
    const pathname = usePathname();
    const { activeProject } = useAppStore();

    // Parse the pathname to create breadcrumb items
    const pathSegments = pathname.split("/").filter(Boolean);

    // Create breadcrumb items based on the path
    const breadcrumbItems = [];

    // Always start with home
    breadcrumbItems.push({
        href: "/",
        label: "ManagME",
        isPage: pathname === "/",
    });

    if (pathSegments.length > 0) {
        // Handle different route patterns
        if (pathSegments[0] === "projects" && pathSegments[1] && activeProject) {
            // Project-specific routes: /projects/[id]/...
            breadcrumbItems.push({
                href: `/projects/${pathSegments[1]}`,
                label: activeProject.name,
                isPage: pathSegments.length === 2,
            });

            if (pathSegments.length > 2) {
                const section = pathSegments[2];
                const sectionLabel = section.charAt(0).toUpperCase() + section.slice(1);
                breadcrumbItems.push({
                    href: `/projects/${pathSegments[1]}/${section}`,
                    label: sectionLabel,
                    isPage: true,
                });
            }
        } else if (pathSegments[0] === "stories") {
            // General stories route
            breadcrumbItems.push({
                href: "/stories",
                label: "Stories",
                isPage: true,
            });
        } else if (pathSegments[0] === "tasks") {
            // General tasks route
            breadcrumbItems.push({
                href: "/tasks",
                label: "Tasks",
                isPage: true,
            });
        } else {
            // Generic handling for other routes
            let currentPath = "";
            pathSegments.forEach((segment, index) => {
                currentPath += `/${segment}`;
                const isLast = index === pathSegments.length - 1;
                const label = segment.charAt(0).toUpperCase() + segment.slice(1);

                breadcrumbItems.push({
                    href: currentPath,
                    label,
                    isPage: isLast,
                });
            });
        }
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <div key={item.href} className="flex items-center">
                        <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                            {item.isPage ? <BreadcrumbPage>{item.label}</BreadcrumbPage> : <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>}
                        </BreadcrumbItem>
                        {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />}
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
