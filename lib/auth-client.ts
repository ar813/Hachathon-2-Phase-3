import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ 
    baseURL: "https://hachathon-2-phase-3.vercel.app",
});

export const {
    signIn,
    signUp,
    signOut,
    useSession
} = authClient;
