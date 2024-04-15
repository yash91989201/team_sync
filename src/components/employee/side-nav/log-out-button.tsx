"use client";
import { useFormStatus } from "react-dom";
// UI
import { Button } from "@/components/ui/button";
// ICONS
import { Loader2, Power } from "lucide-react";

import React from "react";
// ACTIONS
import { logOut } from "@/server/actions/auth";

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
      variant="ghost"
      className="flex items-center gap-3 text-base font-medium text-gray-700 hover:bg-red-600/15 hover:text-red-600 [&>svg]:size-5"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Power />}
      <p>Log Out</p>
    </Button>
  );
}
