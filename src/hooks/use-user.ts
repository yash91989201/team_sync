"use client";
import { use } from "react";
// CONTEXT
import { SessionContext } from "@/providers/session-provider";

export default function useUser() {
  const { user, session } = use(SessionContext);

  if (session === null || user === null)
    throw new Error("UN-AUTHORIZED")

  return {
    user,
    isAdmin: user.role === "ADMIN",
  };
}
