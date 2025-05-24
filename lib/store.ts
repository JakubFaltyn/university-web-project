import { create } from "zustand";
import { ApiService } from "./services/api";
import { Project, Story, Task, User, StoryStatus } from "./types";

interface AppState {
    // User state
    currentUser: User | null;
    users: User[];

    // Project state
    projects: Project[];
    activeProject: Project | null;

    // Story state
    stories: Story[];

    // Task state
    tasks: Task[];

    // Loading states
    isLoading: boolean;

    // Actions
    // User actions
    setCurrentUser: (userId: string) => Promise<void>;
    loadUsers: () => Promise<void>;
    loadUserPreferences: (userId: string) => Promise<void>;
    setUserDefaultProject: (userId: string, projectId: string) => Promise<void>;

    // Project actions
    loadProjects: () => Promise<void>;
    createProject: (project: Omit<Project, "id" | "createdAt">) => Promise<void>;
    updateProject: (project: Project) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    setActiveProject: (projectId: string) => Promise<void>;

    // Story actions
    loadStories: (projectId?: string) => Promise<void>;
    createStory: (story: Omit<Story, "id" | "createdAt">) => Promise<void>;
    updateStory: (story: Story) => Promise<void>;
    deleteStory: (id: string) => Promise<void>;
    updateStoryStatusFromTasks: (storyId: string) => Promise<void>;
    toggleStoryAutoUpdate: (storyId: string, autoUpdate: boolean) => Promise<void>;

    // Task actions
    loadTasks: (storyId?: string) => Promise<void>;
    createTask: (task: Omit<Task, "id" | "createdAt">) => Promise<void>;
    updateTask: (task: Task) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    assignTask: (taskId: string, userId: string) => Promise<void>;
    completeTask: (taskId: string) => Promise<void>;

    // Initialization
    initializeApp: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    // Initial state
    currentUser: null,
    users: [],
    projects: [],
    activeProject: null,
    stories: [],
    tasks: [],
    isLoading: false,

    // User actions
    setCurrentUser: async (userId: string) => {
        try {
            const user = await ApiService.getUserById(userId);
            if (user) {
                set({ currentUser: user });

                // If user has a defaultProjectId, set it as active project
                if (user.defaultProjectId) {
                    const project = await ApiService.getProjectById(user.defaultProjectId);
                    if (project) {
                        set({ activeProject: project });
                        // Save to user preferences as well
                        await ApiService.updateUserPreferences(userId, user.defaultProjectId);
                        // Load stories and tasks for this project
                        await get().loadStories(user.defaultProjectId);
                    } else {
                        console.warn(`Default project ${user.defaultProjectId} not found for user ${userId}`);
                        // Load user preferences as fallback
                        await get().loadUserPreferences(userId);
                    }
                } else {
                    // No default project, load user preferences as before
                    await get().loadUserPreferences(userId);
                }
            }
        } catch (error) {
            console.error("Error setting current user:", error);
        }
    },

    loadUsers: async () => {
        try {
            const users = await ApiService.getUsers();
            set({ users });
        } catch (error) {
            console.error("Error loading users:", error);
        }
    },

    loadUserPreferences: async (userId: string) => {
        try {
            const preferences = await ApiService.getUserPreferences(userId);
            if (preferences?.activeProjectId) {
                const project = await ApiService.getProjectById(preferences.activeProjectId);
                if (project) {
                    set({ activeProject: project });
                    // Load stories and tasks for this project
                    await get().loadStories(preferences.activeProjectId);
                }
            }
        } catch (error) {
            console.error("Error loading user preferences:", error);
        }
    },

    setUserDefaultProject: async (userId: string, projectId: string) => {
        try {
            const user = await ApiService.getUserById(userId);
            if (user) {
                const updatedUser: User = {
                    ...user,
                    defaultProjectId: projectId,
                };

                const result = await ApiService.updateUser(updatedUser);
                if (result) {
                    // Update the users array in state
                    set((state) => ({
                        users: state.users.map((u) => (u.id === userId ? result : u)),
                        currentUser: state.currentUser?.id === userId ? result : state.currentUser,
                    }));

                    // If this is the current user, also set it as active project
                    const { currentUser } = get();
                    if (currentUser?.id === userId) {
                        await get().setActiveProject(projectId);
                    }
                }
            }
        } catch (error) {
            console.error("Error setting user default project:", error);
        }
    },

    // Project actions
    loadProjects: async () => {
        try {
            set({ isLoading: true });
            const projects = await ApiService.getProjects();
            set({ projects, isLoading: false });
        } catch (error) {
            console.error("Error loading projects:", error);
            set({ isLoading: false });
        }
    },

    createProject: async (project) => {
        try {
            const newProject = await ApiService.createProject(project);
            set((state) => ({ projects: [...state.projects, newProject] }));
        } catch (error) {
            console.error("Error creating project:", error);
        }
    },

    updateProject: async (project) => {
        try {
            const updatedProject = await ApiService.updateProject(project);
            if (updatedProject) {
                set((state) => ({
                    projects: state.projects.map((p) => (p.id === updatedProject.id ? updatedProject : p)),
                    activeProject: state.activeProject?.id === updatedProject.id ? updatedProject : state.activeProject,
                }));
            }
        } catch (error) {
            console.error("Error updating project:", error);
        }
    },

    deleteProject: async (id) => {
        try {
            const success = await ApiService.deleteProject(id);
            if (success) {
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                    activeProject: state.activeProject?.id === id ? null : state.activeProject,
                }));

                // Update user preferences if this was the active project
                const { currentUser } = get();
                if (currentUser && get().activeProject?.id === id) {
                    await ApiService.updateUserPreferences(currentUser.id);
                }

                // Reload stories and tasks as some might have been deleted
                await get().loadStories();
                await get().loadTasks();
            }
        } catch (error) {
            console.error("Error deleting project:", error);
        }
    },

    setActiveProject: async (projectId) => {
        try {
            const project = await ApiService.getProjectById(projectId);
            if (project) {
                set({ activeProject: project });

                // Save active project to database
                const { currentUser } = get();
                if (currentUser) {
                    await ApiService.updateUserPreferences(currentUser.id, projectId);
                }

                // Load stories and tasks for this project
                await get().loadStories(projectId);
            }
        } catch (error) {
            console.error("Error setting active project:", error);
        }
    },

    // Story actions
    loadStories: async (projectId) => {
        try {
            const stories = await ApiService.getStories(projectId);
            set({ stories });

            // Load tasks for these stories
            if (stories.length > 0) {
                await get().loadTasks();
            }
        } catch (error) {
            console.error("Error loading stories:", error);
        }
    },

    createStory: async (story) => {
        try {
            const newStory = await ApiService.createStory(story);
            set((state) => ({ stories: [...state.stories, newStory] }));
        } catch (error) {
            console.error("Error creating story:", error);
        }
    },

    updateStory: async (story) => {
        try {
            const updatedStory = await ApiService.updateStory(story);
            if (updatedStory) {
                set((state) => ({
                    stories: state.stories.map((s) => (s.id === updatedStory.id ? updatedStory : s)),
                }));
            }
        } catch (error) {
            console.error("Error updating story:", error);
        }
    },

    deleteStory: async (id) => {
        try {
            const success = await ApiService.deleteStory(id);
            if (success) {
                set((state) => ({
                    stories: state.stories.filter((s) => s.id !== id),
                }));

                // Reload tasks as some might have been deleted
                await get().loadTasks();
            }
        } catch (error) {
            console.error("Error deleting story:", error);
        }
    },

    updateStoryStatusFromTasks: async (storyId: string) => {
        try {
            const story = await ApiService.getStoryById(storyId);
            if (!story || !story.autoUpdateStatus) {
                return; // Don't auto-update if disabled
            }

            const tasks = await ApiService.getTasks(storyId);

            if (tasks.length === 0) {
                // No tasks, keep story as "todo"
                if (story.status !== "todo") {
                    const updatedStory: Story = {
                        ...story,
                        status: "todo",
                    };
                    await get().updateStory(updatedStory);
                }
                return;
            }

            // Calculate status based on task statuses
            const todoTasks = tasks.filter((task) => task.status === "todo");
            const doneTasks = tasks.filter((task) => task.status === "done");

            let newStatus: StoryStatus;

            if (doneTasks.length === tasks.length) {
                // All tasks are done
                newStatus = "done";
            } else if (todoTasks.length === tasks.length) {
                // All tasks are todo
                newStatus = "todo";
            } else {
                // Mixed states or some tasks are doing
                newStatus = "doing";
            }

            // Only update if status has changed
            if (story.status !== newStatus) {
                const updatedStory: Story = {
                    ...story,
                    status: newStatus,
                };
                await get().updateStory(updatedStory);
            }
        } catch (error) {
            console.error("Error updating story status from tasks:", error);
        }
    },

    toggleStoryAutoUpdate: async (storyId: string, autoUpdate: boolean) => {
        try {
            const story = await ApiService.getStoryById(storyId);
            if (story) {
                const updatedStory: Story = {
                    ...story,
                    autoUpdateStatus: autoUpdate,
                };
                await get().updateStory(updatedStory);
            }
        } catch (error) {
            console.error("Error toggling story auto-update:", error);
        }
    },

    // Task actions
    loadTasks: async (storyId) => {
        try {
            const tasks = await ApiService.getTasks(storyId);
            set({ tasks });
        } catch (error) {
            console.error("Error loading tasks:", error);
        }
    },

    createTask: async (task) => {
        try {
            const newTask = await ApiService.createTask(task);
            set((state) => ({ tasks: [...state.tasks, newTask] }));

            // Update story status based on tasks
            await get().updateStoryStatusFromTasks(newTask.storyId);
        } catch (error) {
            console.error("Error creating task:", error);
        }
    },

    updateTask: async (task) => {
        try {
            const updatedTask = await ApiService.updateTask(task);
            if (updatedTask) {
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)),
                }));

                // Update story status based on tasks
                await get().updateStoryStatusFromTasks(updatedTask.storyId);
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    },

    deleteTask: async (id) => {
        try {
            // Get the task before deleting to know which story to update
            const task = await ApiService.getTaskById(id);
            const success = await ApiService.deleteTask(id);
            if (success) {
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                }));

                // Update story status based on remaining tasks
                if (task) {
                    await get().updateStoryStatusFromTasks(task.storyId);
                }
            }
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    },

    assignTask: async (taskId: string, userId: string) => {
        try {
            const task = await ApiService.getTaskById(taskId);
            if (!task) return;

            const updatedTask: Task = {
                ...task,
                assignedUserId: userId,
                status: "doing",
                startDate: new Date().toISOString(),
            };

            await get().updateTask(updatedTask);
        } catch (error) {
            console.error("Error assigning task:", error);
        }
    },

    completeTask: async (taskId: string) => {
        try {
            const task = await ApiService.getTaskById(taskId);
            if (!task) return;

            const updatedTask: Task = {
                ...task,
                status: "done",
                endDate: new Date().toISOString(),
            };

            await get().updateTask(updatedTask);

            // updateTask already calls updateStoryStatusFromTasks, so no need to call it again
        } catch (error) {
            console.error("Error completing task:", error);
        }
    },

    // Initialize app by loading basic data
    initializeApp: async () => {
        try {
            set({ isLoading: true });

            // First, try to load users to see if database has data
            let users = await ApiService.getUsers();

            // If no users exist, initialize database with sample data
            if (users.length === 0) {
                console.log("No users found, initializing database...");
                await ApiService.initializeMockData();
                // Reload users after initialization
                users = await ApiService.getUsers();
            }

            set({ users });
            await get().loadProjects();

            // Auto-select the admin user if no current user is set
            const { currentUser } = get();
            if (!currentUser && users.length > 0) {
                const adminUser = users.find((u) => u.role === "admin") || users[0];
                await get().setCurrentUser(adminUser.id);
            }

            set({ isLoading: false });
        } catch (error) {
            console.error("Error initializing app:", error);
            set({ isLoading: false });
        }
    },
}));
