"use client";
import { use } from "react";
// CONTEXT
import { SessionContext } from "@/providers/session-provider";

export default function useUser() {
  const { user, session } = use(SessionContext);

  if (session === null) {
    return {
      isLoggedIn: false,
    };
  }

  return {
    isLoggedIn: true,
    user,
    isAdmin: user.role === "ADMIN",
  };
}
