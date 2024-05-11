"use client";
import { useState, useEffect } from "react";
// UTILS
import { getGreeting } from "@/lib/utils";
// CUSTOM HOOKS
import useUser from "@/hooks/use-user";

export default function useGreeting() {
  const { user } = useUser();
  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 1800000); // Update every 30 minutes

    return () => clearInterval(intervalId);
  }, []);
  return `${greeting}, ${user.name}!`;
}
