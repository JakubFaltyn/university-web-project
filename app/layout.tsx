import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/ui/navbar/app-sidebar";
import { DynamicBreadcrumb } from "@/components/ui/navbar/dynamic-breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AppProvider } from "@/components/ui/app-provider";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { TRPCReactProvider } from "@/lib/trpc/client";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "ManagME - Project Management",
    description: "A simple project management application",
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <ThemeProvider defaultTheme="system" storageKey="managme-ui-theme">
                    <TRPCReactProvider>
                        <AppProvider>
                            <SidebarProvider>
                                <AppSidebar />
                                <SidebarInset>
                                    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                                        <div className="flex items-center gap-2 px-4">
                                            <SidebarTrigger className="-ml-1" />
                                            <Separator orientation="vertical" className="mr-2 h-4" />
                                            <DynamicBreadcrumb />
                                        </div>
                                        <div className="ml-auto flex items-center gap-2 px-4">
                                            <ThemeToggle />
                                        </div>
                                    </header>
                                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
                                </SidebarInset>
                            </SidebarProvider>
                        </AppProvider>
                    </TRPCReactProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
