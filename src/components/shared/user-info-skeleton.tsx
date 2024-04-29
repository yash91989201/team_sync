// UI
import { Skeleton } from "@ui/skeleton";

export default function UserInfoSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-14 w-14 rounded-full" />
      <div className="flex flex-col items-start gap-0.5">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-6 w-8 rounded-full" />
      </div>
    </div>
  );
}
