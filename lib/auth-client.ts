import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({ 
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const {
    signIn,
    signUp,
    signOut,
    useSession
} = authClient;

// "https://hachathon-2-phase-3.vercel.app"