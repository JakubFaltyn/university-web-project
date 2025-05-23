import UserInfo from "@/components/UserInfo";

export default function Home() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <UserInfo />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Welcome to ManagME</h2>
                    <p className="text-muted-foreground">ManagME is a simple project management application that helps you organize your projects, stories, and tasks.</p>
                    <p className="mt-4 text-muted-foreground">Get started by selecting or creating a project in the Projects section.</p>
                </div>

                <div className="border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
                    <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
                        <li>Create a new project</li>
                        <li>Set it as your active project</li>
                        <li>Create stories for your project</li>
                        <li>Add tasks to your stories</li>
                        <li>Assign tasks to team members</li>
                    </ol>
                </div>

                <div className="border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">About</h2>
                    <p className="text-muted-foreground">This application was built using Next.js, TypeScript, Tailwind CSS, and Zustand.</p>
                    <p className="mt-4 text-muted-foreground">Data is stored in your browser&apos;s localStorage.</p>
                </div>
            </div>
        </div>
    );
}
