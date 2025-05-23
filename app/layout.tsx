import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import AppProvider from "@/components/AppProvider";
import { ThemeProvider } from "@/lib/theme-provider";
import { AuthProvider } from "@/components/SessionProvider";

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

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <AuthProvider>
                    <ThemeProvider defaultTheme="system" storageKey="managme-ui-theme">
                        <AppProvider>
                            <Navigation />
                            <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
                        </AppProvider>
                    </ThemeProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
