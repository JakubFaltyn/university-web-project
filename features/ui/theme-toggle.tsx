"use client";

import * as React from "react";
import { MonitorSpeaker, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [open, setOpen] = React.useState(false);
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const themes = [
        {
            name: "Light",
            value: "light" as const,
            icon: SunIcon,
            description: "Light theme",
        },
        {
            name: "Dark",
            value: "dark" as const,
            icon: MoonIcon,
            description: "Dark theme",
        },
        {
            name: "System",
            value: "system" as const,
            icon: MonitorSpeaker,
            description: "Follow system preference",
        },
    ];

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                <SunIcon className="h-4 w-4" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    }

    const currentTheme = themes.find((t) => t.value === theme);
    const CurrentIcon = currentTheme?.icon || SunIcon;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                    <CurrentIcon className="h-4 w-4" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[300px]">
                <DialogHeader>
                    <DialogTitle>Choose theme</DialogTitle>
                </DialogHeader>
                <div className="grid gap-2">
                    {themes.map((themeOption) => {
                        const Icon = themeOption.icon;
                        return (
                            <Button
                                key={themeOption.value}
                                variant={theme === themeOption.value ? "default" : "ghost"}
                                className="justify-start h-10"
                                onClick={() => {
                                    setTheme(themeOption.value);
                                    setOpen(false);
                                }}>
                                <Icon className="mr-2 h-4 w-4" />
                                <div className="flex flex-col items-start">
                                    <span>{themeOption.name}</span>
                                    <span className="text-xs text-muted-foreground">{themeOption.description}</span>
                                </div>
                            </Button>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ThemeToggleSimple() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const handleToggle = () => {
        if (theme === "light") {
            setTheme("dark");
        } else if (theme === "dark") {
            setTheme("system");
        } else {
            setTheme("light");
        }
    };

    if (!mounted) {
        return (
            <Button variant="ghost" size="sm" className="h-8 w-8 px-0">
                <SunIcon className="h-4 w-4" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        );
    }

    return (
        <Button variant="ghost" size="sm" onClick={handleToggle} className="h-8 w-8 px-0">
            <SunIcon className="h-4 w-4" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
