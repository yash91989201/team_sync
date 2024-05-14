"use client";
import Link from "next/link";
import { toast } from "sonner";
// UTILS
import { api } from "@/trpc/react";
import { formatDate } from "@/lib/date-time-utils";
// UI
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { Skeleton } from "@ui/skeleton";
import { Separator } from "@ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@ui/avatar";
// ICONS
import {
  Loader2,
  RotateCcw,
  GitPullRequestDraft,
  TreePalm,
} from "lucide-react";

export function EmpLeaveSection() {
  const {
    mutateAsync: approveLeave,
    isPending: isApproveLeavePending,
    variables: approveLeaveVariables,
  } = api.leaveRouter.approveLeave.useMutation();

  const {
    mutateAsync: rejectLeave,
    isPending: isRejectLeavePending,
    variables: rejectLeaveVariables,
  } = api.leaveRouter.rejectLeave.useMutation();

  const {
    data: empsOnLeave = [],
    isFetching: isOnLeaveEmpsLoading,
    refetch: refetchEmpsOnLeave,
  } = api.statsRouter.onLeaveEmps.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: pendingLeaves = [],
    isFetching: isPendingLeaveLoading,
    refetch: refetchPendingLeaves,
  } = api.statsRouter.pendingLeaveRequests.useQuery(undefined, {
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
  });

  const approveLeaveAction = async (leaveRequestId: string) => {
    const actionResponse = await approveLeave({ leaveRequestId });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchEmpsOnLeave();
      await refetchPendingLeaves();
    } else {
      toast.error(actionResponse.message);
    }
  };

  const rejectLeaveAction = async (leaveRequestId: string) => {
    const actionResponse = await rejectLeave({ leaveRequestId });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      await refetchEmpsOnLeave();
      await refetchPendingLeaves();
    } else {
      toast.error(actionResponse.message);
    }
  };

  const isApproving = (leaveRequestId: string) => {
    if (approveLeaveVariables === undefined) return false;
    return approveLeaveVariables.leaveRequestId === leaveRequestId;
  };

  const isRejecting = (leaveRequestId: string) => {
    if (rejectLeaveVariables === undefined) return false;
    return rejectLeaveVariables.leaveRequestId === leaveRequestId;
  };

  if (isOnLeaveEmpsLoading || isPendingLeaveLoading) {
    return <EmpLeavesSectionSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {/* employees on leave column */}
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-xl bg-sky-100">
            <TreePalm className="size-8 text-sky-500" />
          </div>
          <p className="flex-1 text-lg font-semibold text-sky-500">
            {empsOnLeave.length}&nbsp;
            {empsOnLeave.length === 1 ? "employee" : "employees"} on leave today
          </p>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => refetchEmpsOnLeave()}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
        <Separator />
        <>
          {empsOnLeave.length === 0 ? (
            <p className="flex items-center justify-center p-3 text-gray-600">
              No employees on leave today
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
              {empsOnLeave.slice(0, 5).map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center gap-3 rounded-xl border p-1.5"
                >
                  <Avatar className="size-12">
                    <AvatarImage
                      src={leave.employee.imageUrl!}
                      alt={leave.employee.name}
                    />
                    <AvatarFallback>{leave.employee.name}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1.5 text-sm font-semibold text-gray-600">
                    <p>{leave.employee.name}</p>
                    <p className="font-semibold">
                      {leave.leaveDays === 1
                        ? formatDate(leave.fromDate, "dd/MM")
                        : `
                      ${formatDate(leave.fromDate, "dd/MM")} to ${formatDate(leave.toDate, "dd/MM")}
                      `}
                      {leave.leaveDays > 2 ? "days" : null}
                    </p>
                    <Badge className="w-fit bg-sky-100 text-sky-500 hover:cursor-default hover:bg-sky-100">
                      {leave.leaveType.type}
                    </Badge>
                  </div>
                </div>
              ))}
              {empsOnLeave?.length > 5 ? (
                <Link
                  href={`/admin/leave/leave-requests?status=approved&date=${formatDate()}`}
                  className="flex items-center justify-center rounded-xl border p-1.5 text-xl font-semibold text-gray-400 hover:border-blue-500 hover:text-blue-500"
                >
                  <span>+ {empsOnLeave.length - 5} more</span>
                </Link>
              ) : null}
            </div>
          )}
        </>
      </div>

      {/* pending leave requests column */}
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-xl bg-amber-100 text-lg">
            <GitPullRequestDraft className="size-8 text-amber-500" />
          </div>
          <p className="flex-1 text-lg font-semibold text-amber-500">
            {pendingLeaves.length} pending leave&nbsp;
            {pendingLeaves.length === 1 ? "request" : "requests"} in&nbsp;
            {formatDate(undefined, "MMMM")}
          </p>
          <Button
            variant="outline"
            size="icon"
            className="rounded-xl"
            onClick={() => refetchPendingLeaves()}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
        <Separator />
        {pendingLeaves.length === 0 ? (
          <p className="flex items-center justify-center p-3 text-gray-600">
            No pending leave requests in {formatDate(undefined, "MMMM")}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
            {pendingLeaves.slice(0, 3).map((leaveRequest) => (
              <div
                key={leaveRequest.id}
                className="flex items-center gap-3 rounded-xl border p-1.5"
              >
                <Avatar className="size-10">
                  <AvatarImage
                    src={leaveRequest.employee.imageUrl!}
                    alt={leaveRequest.employee.name}
                  />
                  <AvatarFallback>{leaveRequest.employee.name}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1.5 text-sm font-semibold text-gray-600">
                  <p>{leaveRequest.employee.name}</p>
                  <p className="space-x-1.5 text-sm font-semibold">
                    <span>{leaveRequest.leaveType.type}</span>
                    <span>
                      (
                      {leaveRequest.leaveDays === 1
                        ? formatDate(leaveRequest.fromDate, "dd/MM")
                        : `${formatDate(leaveRequest.fromDate, "dd/MM")} to ${formatDate(leaveRequest.toDate, "dd/MM")}`}
                      )
                    </span>
                  </p>
                  <div className="space-x-3">
                    <Button
                      variant="link"
                      className="h-fit w-fit gap-1.5 p-0 px-0 text-green-500"
                      disabled={
                        isApproving(leaveRequest.id) && isApproveLeavePending
                      }
                      onClick={() => approveLeaveAction(leaveRequest.id)}
                    >
                      {isApproving(leaveRequest.id) && isApproveLeavePending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : null}
                      <span>Accept</span>
                    </Button>
                    <Button
                      variant="link"
                      className="h-fit w-fit gap-1.5 p-0 px-0 text-red-500"
                      disabled={
                        isRejecting(leaveRequest.id) && isRejectLeavePending
                      }
                      onClick={() => rejectLeaveAction(leaveRequest.id)}
                    >
                      {isRejecting(leaveRequest.id) && isRejectLeavePending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : null}
                      <span>Reject</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {pendingLeaves?.length > 3 ? (
              <Link
                href={`/admin/leave/leave-requests?status=pending&date=${formatDate()}`}
                className="flex items-center justify-center rounded-xl border p-1.5 text-xl font-semibold text-gray-400 hover:border-blue-500 hover:text-blue-500"
              >
                <span>+ {pendingLeaves?.length - 3} more</span>
              </Link>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmpLeavesSectionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* employees on leave column */}
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-3  shadow">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-xl bg-sky-100">
            <TreePalm className="size-8 text-sky-500" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Separator />
        <div className="grid h-full grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border p-1.5"
            >
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2 text-sm font-semibold text-gray-600">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* pending leave requests column */}
      <div className="flex flex-col gap-3 rounded-2xl bg-card p-3 shadow">
        <div className="flex items-center gap-3">
          <div className="flex size-14 items-center justify-center rounded-xl bg-amber-100 text-lg">
            <GitPullRequestDraft className="size-8 text-amber-500" />
          </div>
          <div className="flex-1">
            <Skeleton className="h-5 w-1/2" />
          </div>
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
        <Separator />
        <div className="grid h-full grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-xl border p-1.5"
            >
              <Skeleton className="size-12 rounded-full" />
              <div className="flex flex-1 flex-col gap-2 text-sm font-semibold text-gray-600">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex items-center gap-3">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
