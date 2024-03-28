"use client";
import Link from "next/link";
// UTILS
import { buttonVariants } from "@/components/ui/button";
// UI
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
// ICONS
import { ArrowRight } from "lucide-react";

export default function AuthCardWrapper({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
}: AuthCardWrapperProps) {
  return (
    <Card className="w-[96vw] border-0 shadow-none md:max-w-[480px]">
      <CardHeader className="flex flex-col items-center justify-center gap-y-3">
        <Link href="/">LOGO</Link>
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
