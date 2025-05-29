import { router } from "./trpc";
import { tasksRouter } from "./routers/tasks";
import { projectsRouter } from "./routers/projects";
import { storiesRouter } from "./routers/stories";
import { usersRouter } from "./routers/users";
import { initRouter } from "./routers/init";

export const appRouter = router({
    tasks: tasksRouter,
    projects: projectsRouter,
    stories: storiesRouter,
    users: usersRouter,
    init: initRouter,
});

export type AppRouter = typeof appRouter;
