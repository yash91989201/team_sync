"use client";
import React from "react";
import { useFormStatus } from "react-dom";
// ACTIONS
import { logOut } from "@/server/actions/auth";
// UI
import { Button } from "@ui//button";
// ICONS
import { Loader2, Power } from "lucide-react";

export default function LogoutButton() {
  return (
    <form action={logOut}>
      <LogoutButtonInner />
    </form>
  );
}

function LogoutButtonInner() {
  const { pending } = useFormStatus();
  return (
    <Button
      size="icon"
      variant="outline"
      className="rounded-xl [&>svg]:size-4 text-red-500 hover:text-red-500 border-red-500 hover:bg-white"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Power />}
    </Button>
  );
}
