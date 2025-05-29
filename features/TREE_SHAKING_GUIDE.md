# Tree Shaking Guide

This guide helps you import components efficiently to minimize bundle size.

## ✅ Recommended Import Patterns

### 1. Specific Category Imports (Best for Tree Shaking)

```typescript
// Import only form-related components
import { Button, Input, Label } from "@features/ui/forms";

// Import only layout components
import { Card, Separator } from "@features/ui/layout";

// Import only interactive components
import { Dialog, DialogContent, DialogHeader } from "@features/ui/interactive";
```

### 2. Direct Component Imports (Good for Tree Shaking)

```typescript
// Import specific components directly
import { Button } from "@features/ui/button";
import { Dialog } from "@features/ui/dialog";
import { Card } from "@features/ui/card";
```

### 3. Feature-Specific Imports (Good)

```typescript
// Import from specific features
import { UserInfo } from "@features/users";
import { TaskBoard } from "@features/tasks";
import { ProjectList } from "@features/projects";
```

## ❌ Avoid These Patterns (Poor Tree Shaking)

### 1. Large Barrel Imports

```typescript
// DON'T: This imports the entire UI library
import { Button, Dialog, Card, Input, Label, Separator, Avatar, Skeleton } from "@features/ui";

// DON'T: This imports everything from features
import { Button, UserInfo, TaskBoard } from "@features";
```

### 2. Wildcard Imports

```typescript
// DON'T: This imports everything
import * as UI from "@features/ui";
import * as Features from "@features";
```

## 📁 Available Import Paths

### UI Components by Category

-   `@features/ui/forms` - Form components (Button, Input, Label, Textarea, Form)
-   `@features/ui/layout` - Layout components (Card, Separator, Breadcrumb, Sidebar)
-   `@features/ui/interactive` - Interactive components (Dialog, DropdownMenu, Sheet, Tooltip)
-   `@features/ui/navbar` - Navigation components (AppSidebar, Navigation, NavMain)

### Feature Components

-   `@features/auth` - Authentication components
-   `@features/users` - User-related components
-   `@features/projects` - Project management components
-   `@features/stories` - Story management components
-   `@features/tasks` - Task management components
-   `@features/hooks` - Shared hooks

## 🎯 Bundle Size Impact

| Import Pattern   | Bundle Impact | Tree Shaking |
| ---------------- | ------------- | ------------ |
| Direct imports   | Minimal       | ✅ Excellent |
| Category imports | Small         | ✅ Good      |
| Feature imports  | Medium        | ⚠️ Moderate  |
| Barrel imports   | Large         | ❌ Poor      |
| Wildcard imports | Maximum       | ❌ None      |

## 🔧 Migration Examples

### Before (Poor Tree Shaking)

```typescript
import { Button, Dialog, DialogContent, Card, Input, Label } from "@features/ui";
```

### After (Good Tree Shaking)

```typescript
import { Button } from "@features/ui/interactive";
import { Dialog, DialogContent } from "@features/ui/interactive";
import { Card } from "@features/ui/layout";
import { Input, Label } from "@features/ui/forms";
```

### Or Even Better (Best Tree Shaking)

```typescript
import { Button } from "@features/ui/button";
import { Dialog, DialogContent } from "@features/ui/dialog";
import { Card } from "@features/ui/card";
import { Input } from "@features/ui/input";
import { Label } from "@features/ui/label";
```

# Direct Import Guide (No Barrel Files)

Following the recommendations from [TkDodo's article](https://tkdodo.eu/blog/please-stop-using-barrel-files), we've eliminated all barrel files for better performance and tree shaking.

## ✅ Direct Import Pattern (Only Approach)

### Import Components Directly from Their Files

```typescript
// UI Components - Direct imports only
import { Button } from "@features/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@features/ui/dialog";
import { Card, CardContent, CardHeader } from "@features/ui/card";
import { Input } from "@features/ui/input";
import { Label } from "@features/ui/label";

// Feature Components - Direct imports only
import { UserInfo } from "@features/users/user-info";
import { TaskBoard } from "@features/tasks/task-board";
import { ProjectList } from "@features/projects/project-list";
import { StoryList } from "@features/stories/story-list";

// Forms - Direct imports only
import { TaskForm } from "@features/tasks/forms/task-form";
import { StoryForm } from "@features/stories/forms/story-form";
import { ProjectForm } from "@features/projects/forms/project-form";

// Navbar Components - Direct imports only
import { AppSidebar } from "@features/ui/navbar/app-sidebar";
import { Navigation } from "@features/ui/navbar/navigation";
import { NavMain } from "@features/ui/navbar/nav-main";

// Auth Components - Direct imports only
import { AuthProvider } from "@features/auth/session-provider";

// Hooks - Direct imports only
import { useMobile } from "@features/hooks/use-mobile";

// Models - Direct imports only
import { UserModel } from "@features/users/user.model";
import { TaskModel } from "@features/tasks/task.model";
import { StoryModel } from "@features/stories/story.model";
import { ProjectModel } from "@features/projects/project.model";
```

## ❌ What We Eliminated (Barrel Files)

We removed ALL index.ts files that were doing re-exports:

-   ❌ `features/index.ts`
-   ❌ `features/ui/index.ts`
-   ❌ `features/auth/index.ts`
-   ❌ `features/users/index.ts`
-   ❌ `features/projects/index.ts`
-   ❌ `features/stories/index.ts`
-   ❌ `features/tasks/index.ts`
-   ❌ `features/hooks/index.ts`
-   ❌ `features/ui/navbar/index.ts`
-   ❌ All `forms/index.ts` files

## 🚀 Performance Benefits

Based on [TkDodo's research](https://tkdodo.eu/blog/please-stop-using-barrel-files):

1. **Development Speed**: Up to 68% reduction in modules loaded (11k → 3.5k)
2. **No Circular Imports**: Eliminates accidental circular dependency risks
3. **Better Tree Shaking**: Bundlers can optimize more effectively
4. **Explicit Dependencies**: Clear understanding of what each file actually uses

## 📁 Current File Structure

```
features/
├── auth/
│   ├── session-provider.tsx
│   └── auth.ts
├── hooks/
│   └── use-mobile.ts
├── projects/
│   ├── project-list.tsx
│   ├── new-project-modal.tsx
│   ├── project.model.ts
│   └── forms/
│       └── project-form.tsx
├── stories/
│   ├── story-list.tsx
│   ├── story.model.ts
│   └── forms/
│       └── story-form.tsx
├── tasks/
│   ├── task-board.tsx
│   ├── task.model.ts
│   ├── forms/
│   │   └── task-form.tsx
│   └── components/
│       └── task-card.tsx
├── users/
│   ├── user-info.tsx
│   ├── nav-user.tsx
│   ├── user.model.ts
│   └── user-preferences.model.ts
└── ui/
    ├── button.tsx
    ├── dialog.tsx
    ├── card.tsx
    ├── input.tsx
    ├── form.tsx
    ├── sidebar.tsx
    ├── theme-toggle.tsx
    ├── theme-provider.tsx
    ├── app-provider.tsx
    └── navbar/
        ├── app-sidebar.tsx
        ├── navigation.tsx
        ├── nav-main.tsx
        ├── nav-secondary.tsx
        └── team-switcher.tsx
```

## 🎯 Import Rules

1. **Always import directly from the file**: `@features/ui/button` not `@features/ui`
2. **No index.ts files**: We don't use barrel exports anywhere
3. **Explicit paths**: Every import shows exactly which file it comes from
4. **Named exports only**: All components use named exports, no default exports

## 🔧 Migration Complete

All imports have been converted from:

```typescript
// OLD (barrel imports)
import { Button, Dialog, Card } from "@features/ui";
import { UserInfo } from "@features/users";
```

To:

```typescript
// NEW (direct imports)
import { Button } from "@features/ui/button";
import { Dialog } from "@features/ui/dialog";
import { Card } from "@features/ui/card";
import { UserInfo } from "@features/users/user-info";
```

This approach follows industry best practices and eliminates the performance issues associated with barrel files.
