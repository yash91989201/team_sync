"use client";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
// TYPES
import type { NavLinkProps } from "@/lib/types";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UI
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ui/command";
import { Button } from "@ui/button";
// CONSTANTS
import { ADMIN_SEARCH_ROUTES } from "@/constants/routes";

export default function ModuleSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const commandDialog = useToggle(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        if (
          (e.target instanceof HTMLElement && e.target.isContentEditable) ||
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement
        ) {
          return;
        }

        e.preventDefault();
        commandDialog.toggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandDialog]);

  const runCommand = useCallback(
    (command: () => unknown) => {
      command();
      router.refresh();
      commandDialog.close();
    },
    [commandDialog, router],
  );

  const isActive = (navLink: NavLinkProps) => {
    const { matchExact, href } = navLink;
    return matchExact ? pathname === href : pathname.startsWith(href);
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
        onClick={commandDialog.open}
      >
        <span className="hidden lg:inline-flex">Search module...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">/</span>
        </kbd>
      </Button>
      <CommandDialog
        open={commandDialog.isOpen}
        onOpenChange={commandDialog.toggle}
      >
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Links">
            {ADMIN_SEARCH_ROUTES.map((route) => (
              <CommandItem
                key={route.href}
                value={route.label}
                className={
                  isActive(route)
                    ? "bg-primary-foreground text-primary hover:bg-primary-foreground"
                    : "text-gray-700"
                }
                onSelect={() => {
                  runCommand(() => router.push(route.href));
                }}
              >
                <route.Icon className="mr-2 size-3" />
                {route.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
