"use client";
import { use } from "react";
// CONTEXT
import { SessionContext } from "@/providers/session-provider";

export default function useSession() {
  const { session } = use(SessionContext);

  if (session === null) {
    return {
      isLoggedIn: false,
    };
  }

  return {
    isLoggedIn: true,
    session,
  };
}
