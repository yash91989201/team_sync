"use client";
import { use } from "react";
// CONTEXT
import { SessionContext } from "@/providers/session-provider";

export default function useAuth() {
  const { user, session } = use(SessionContext);

  if (session === null) {
    return {
      isLoggedIn: false,
    };
  }

  const logOut = () => {
    //
  };

  return {
    isLoggedIn: true,
    userId: user.id,
    sessionId: session.id,
    role: user.role,
    logOut,
  };
}
