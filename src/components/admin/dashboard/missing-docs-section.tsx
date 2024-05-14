"use client";
import Link from "next/link";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { buttonVariants } from "@ui/button";
// UI
import { Button } from "@ui/button";
import { Separator } from "@ui/separator";
import { Skeleton } from "@ui/skeleton";
// ICONS
import { ChevronRight, FileQuestion, FileX, RotateCcw } from "lucide-react";

export function MissingDocsSection() {
  const {
    data: empDocs = [],
    isFetching,
    refetch: refetchMissingEmpDocs,
  } = api.statsRouter.missingEmpDocs.useQuery(undefined, {
    enabled: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  });

  if (isFetching) {
    return <MissingDocsSectionSkeleton />;
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-amber-100">
          <FileQuestion className="size-8 text-amber-500" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 self-start font-semibold">
          <p className="text-xl text-amber-500">Missing Documents</p>
          <p className="flex-1 text-sm text-gray-500">
            {empDocs.length}&nbsp; document types not added for employees
          </p>
        </div>
        <Link
          className={cn(
            buttonVariants({
              variant: "link",
            }),
            "h-fit w-fit items-center justify-between p-0 text-amber-500",
          )}
          href="/admin/document-center/employee-documents"
        >
          <span>Upload Now</span>
          <ChevronRight className="size-4" />
        </Link>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          onClick={() => refetchMissingEmpDocs()}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
      <Separator />
      {empDocs.length === 0 ? (
        <p className="rounded-2xl bg-card p-3 text-gray-600">
          All document types added for all employees
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {empDocs.map((document) => (
            <div
              key={document.type}
              className="flex items-center gap-6 rounded-2xl  border bg-card p-3"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100">
                <FileX className="size-6 text-amber-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-gray-600">{document.type}</p>
                <p className="font-semibold">{document.empCount}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MissingDocsSectionSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
      <div className="flex items-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-xl bg-amber-100">
          <FileQuestion className="size-8 text-amber-500" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 self-start">
          <p className="flex-1 text-xl font-semibold text-amber-500">
            Missing Documents
          </p>
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-9" />
      </div>
      <Separator />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-center gap-6 rounded-2xl  border bg-card p-3"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-100 ">
              <FileX className="size-6 text-amber-500" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
