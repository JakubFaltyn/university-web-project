import { create } from "zustand";
import { ApiService } from "./services/api";
import { Project, Story, Task, User } from "./types";

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
        ApiService.setCurrentUser(userId);
        try {
            const user = await ApiService.getUserById(userId);
            if (user) {
                set({ currentUser: user });
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
                ApiService.setActiveProject(project);
                set({ activeProject: project });

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
            }
        } catch (error) {
            console.error("Error updating task:", error);
        }
    },

    deleteTask: async (id) => {
        try {
            const success = await ApiService.deleteTask(id);
            if (success) {
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id),
                }));
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

            const result = await ApiService.updateTask(updatedTask);
            if (result) {
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === result.id ? result : t)),
                }));
            }
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

            const result = await ApiService.updateTask(updatedTask);
            if (result) {
                set((state) => ({
                    tasks: state.tasks.map((t) => (t.id === result.id ? result : t)),
                }));
            }
        } catch (error) {
            console.error("Error completing task:", error);
        }
    },

    // Initialization
    initializeApp: async () => {
        try {
            set({ isLoading: true });

            // Initialize database with sample data
            await ApiService.initializeMockData();

            // Load current user
            const currentUserData = ApiService.getCurrentUser();
            let currentUser = null;
            if (currentUserData?.id) {
                currentUser = await ApiService.getUserById(currentUserData.id);
            }

            // Load users
            const users = await ApiService.getUsers();

            // If no current user is set, set the first admin user
            if (!currentUser && users.length > 0) {
                const adminUser = users.find((u) => u.role === "admin") || users[0];
                await get().setCurrentUser(adminUser.id);
                currentUser = adminUser;
            }

            // Load projects
            const projects = await ApiService.getProjects();

            // Get active project if any
            const activeProjectData = ApiService.getActiveProject();
            let activeProject = null;
            if (activeProjectData?.id) {
                activeProject = await ApiService.getProjectById(activeProjectData.id);
            }

            // Load stories for active project
            const stories = activeProject ? await ApiService.getStories(activeProject.id) : [];

            // Load tasks
            const tasks = await ApiService.getTasks();

            // Update state
            set({
                currentUser,
                users,
                projects,
                activeProject,
                stories,
                tasks,
                isLoading: false,
            });
        } catch (error) {
            console.error("Error initializing app:", error);
            set({ isLoading: false });
        }
    },
}));
