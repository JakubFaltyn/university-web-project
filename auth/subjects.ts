import { createSubjects } from "@openauthjs/openauth";

export const subjects = createSubjects({
    user: {
        id: "string",
        email: "string",
        name: "string",
        role: "string",
    },
});

export const { user } = subjects;
