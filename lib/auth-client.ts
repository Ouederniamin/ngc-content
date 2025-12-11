"use client";

import { createAuthClient } from "better-auth/react"; // must import from better-auth/react

export const authClient = createAuthClient({
  // baseURL is optional if running on same domain
});

export const { signIn, signUp, signOut, useSession } = authClient;
