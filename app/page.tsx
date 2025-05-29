import { auth, login, logout } from "./actions";

export default async function HomePage() {
    const subject = await auth();

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            {/* Authentication Status Section */}
            <div className="rounded-xl bg-muted/50 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        {subject ? (
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold">Welcome back!</h2>
                                <p className="text-sm text-muted-foreground">
                                    Logged in as <code className="bg-muted px-2 py-1 rounded text-xs">{subject.properties.id}</code>
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <h2 className="text-lg font-semibold">Welcome to University Web Project</h2>
                                <p className="text-sm text-muted-foreground">Please log in to access your dashboard</p>
                            </div>
                        )}
                    </div>

                    <div>
                        {subject ? (
                            <form action={logout}>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2">
                                    Logout
                                </button>
                            </form>
                        ) : (
                            <form action={login}>
                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                    Login with OpenAuth
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Projects</p>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Tasks</p>
                </div>
                <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Stories</p>
                </div>
            </div>

            {/* Dashboard Content */}
            <div className="min-h-[50vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
                <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Dashboard</h3>
                    <p className="text-sm text-muted-foreground">Welcome to your project management dashboard. Use the sidebar to navigate between different sections.</p>
                </div>
            </div>
        </div>
    );
}
