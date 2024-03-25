"use client";
import { useFormStatus } from "react-dom";
// UI
import { Button } from "@/components/ui/button";
// ICONS
import { Loader2 } from "lucide-react";

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
    <Button className="flex items-center justify-center gap-3">
      <span>Log Out</span>
      {pending && <Loader2 className="animate-spin" />}
    </Button>
  );
}
