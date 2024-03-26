"use client";
import { useFormStatus } from "react-dom";
// UTILS
import { cn } from "@/lib/utils";
// UI
import { Button } from "@/components/ui/button";
// ICONS
import { Loader2, Power } from "lucide-react";

import React from "react";
// ACTIONS
import { logOut } from "@/server/actions/auth";

export default function LogoutButton({
  sideNavOpen,
}: {
  sideNavOpen: boolean;
}) {
  return (
    <form action={logOut} className="w-full">
      <LogoutButtonInner sideNavOpen={sideNavOpen} />
    </form>
  );
}

function LogoutButtonInner({ sideNavOpen }: { sideNavOpen: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      variant="ghost"
      size={sideNavOpen ? "default" : "icon"}
      className={cn(
        "flex w-full items-center gap-3 text-base font-medium [&>svg]:size-5",
        sideNavOpen ? "justify-start" : "justify-center",
      )}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Power />}
      {sideNavOpen && <p>Log Out</p>}
    </Button>
  );
}
