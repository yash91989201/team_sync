"use client";
import Link from "next/link";
// UTILS
import { buttonVariants } from "@ui/button";
// UI
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@ui/card";
// ICONS
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function AuthCardWrapper({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
}: AuthCardWrapperProps) {
  return (
    <Card className="w-[96vw] border-0 shadow-none md:max-w-[480px]">
      <CardHeader className="flex flex-col items-center justify-center gap-y-3">
        <div className="relative aspect-square w-20">
          <Image src="/team_sync_logo.png" alt="team_sync_logo" fill />
        </div>
        <p className="text-xl font-semibold">{headerLabel}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {backButtonLabel && backButtonHref && (
        <CardFooter className="flex flex-col gap-3">
          <Link
            href={backButtonHref}
            className={buttonVariants({
              variant: "link",
              size: "sm",
              className: "flex items-center justify-center gap-2",
            })}
          >
            <span>{backButtonLabel}</span>
            <ArrowRight className="size-4" />
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
