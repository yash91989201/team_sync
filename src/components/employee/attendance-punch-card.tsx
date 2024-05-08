"use client";
import { toast } from "sonner";
// UTILS
import { api } from "@/trpc/react";
import { getShiftTimeString } from "@/lib/utils";
import { formatDate } from "@/lib/date-time-utils";
// UI
import { Button } from "@ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui/card";
import { Skeleton } from "@ui/skeleton";
// ICONS
import { Loader2 } from "lucide-react";

export default function AttendancePunchCard() {
  const {
    data,
    isLoading,
    refetch: refetchAttendanceStatus,
  } = api.employeeRouter.getAttendanceStatus.useQuery({
    date: formatDate(),
  });

  const { mutateAsync: punchIn, isPending: isPunchingIn } =
    api.employeeRouter.punchIn.useMutation();

  const { mutateAsync: punchOut, isPending: isPunchingOut } =
    api.employeeRouter.punchOut.useMutation();

  const punchInAction = async () => {
    const actionResponse = await punchIn({
      date: new Date(),
    });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchAttendanceStatus();
    } else {
      toast.error(actionResponse.message);
    }
  };

  const punchOutAction = async () => {
    if (attendanceData === undefined) return;
    const actionResponse = await punchOut({
      attendanceId: attendanceData.id,
      date: new Date(),
    });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchAttendanceStatus();
    } else {
      toast.error(actionResponse.message);
    }
  };

  if (isLoading) return <AttendanceCardLoadingSkeleton />;

  const {
    isAttendanceMarked = false,
    isShiftComplete = false,
    attendanceData = undefined,
  } = data ?? {};

  if (attendanceData === undefined) {
    return (
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Attendance</CardTitle>
          <CardDescription>
            Mark your attendance before your shift time to avoid late login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Not Signed In yet.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={punchInAction} disabled={isPunchingIn}>
            <span>Sign In</span>
            {isPunchingOut && (
              <Loader2 className="animate-spin [&>svg]:size-4" />
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>Mark your attendance.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-1 text-sm font-semibold">
          <p>Sign In: {getShiftTimeString(attendanceData.punchIn)}</p>
          &minus;
          {attendanceData.punchOut !== null ? (
            <p>Sign Out: {getShiftTimeString(attendanceData.punchOut)}</p>
          ) : (
            <p>N/A</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isAttendanceMarked && isShiftComplete ? (
          <p className="text-sm">
            Your today&apos; shift is complete, come back tommorow.
          </p>
        ) : (
          <Button
            className="gap-1"
            disabled={isPunchingOut}
            onClick={punchOutAction}
          >
            {isPunchingOut && <Loader2 className="size-4 animate-spin" />}
            <span>Sign Out</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

const AttendanceCardLoadingSkeleton = () => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  );
};
