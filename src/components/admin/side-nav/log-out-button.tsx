"use client";
import React from "react";
import { useFormStatus } from "react-dom";
// ACTIONS
import { logOut } from "@/server/actions/auth";
// UI
import { Button } from "@/components/ui/button";
// ICONS
import { Loader2, Power } from "lucide-react";

export default function LogoutButton() {
  return (
    <form action={logOut} className="w-full">
      <LogoutButtonInner />
    </form>
  );
}

function LogoutButtonInner() {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 text-base font-medium text-gray-700 hover:bg-red-600/15 hover:text-red-600 [&>svg]:size-5"
    >
      {pending ? <Loader2 className="animate-spin" /> : <Power />}
      <p className="text-base font-normal">Log Out</p>
    </Button>
  );
}
