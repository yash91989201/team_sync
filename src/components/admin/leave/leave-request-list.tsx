"use client";
import { format } from "date-fns";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// UI
import type {
  LeaveRequestSchemaType,
  LeaveTypeSchemaType,
  UserType,
} from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@ui//card";
import { Badge } from "@ui//badge";
import { Button } from "@ui//button";

type LeaveRequestProps = LeaveRequestSchemaType & {
  employee: UserType;
  leaveType: LeaveTypeSchemaType;
};

export default function LeaveRequestList({
  leaveRequests,
}: {
  leaveRequests: LeaveRequestProps[];
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {leaveRequests.map((leaveRequest) => (
        <LeaveRequestCard key={leaveRequest.id} {...leaveRequest} />
      ))}
    </div>
  );
}

const LeaveRequestCard = (leaveRequest: LeaveRequestProps) => {
  const {
    id: leaveRequestId,
    employee,
    leaveType,
    fromDate,
    toDate,
    leaveDays,
    status,
  } = leaveRequest;

  const { id: empId } = employee;

  const { mutate: rejectLeave, isPending: isRejectingLeave } =
    api.leaveRouter.rejectLeave.useMutation();

  const { mutate: approveLeave, isPending: isApprovingLeave } =
    api.leaveRouter.approveLeave.useMutation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee.name}</CardTitle>
        <CardDescription>{leaveType.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          {format(fromDate, "dd/MM/yyyy")} &minus;
          {format(toDate, "dd/MM/yyyy")}
        </p>
        <p>Total: {leaveDays} Days</p>
        <Badge
          className={cn(
            "rounded-full",
            status === "pending" && "bg-amber-500",
            status === "rejected" && "bg-red-500",
            status === "approved" && "bg-green-500",
          )}
        >
          {status}
        </Badge>
      </CardContent>
      {status === "pending" ? (
        <CardFooter>
          <Button
            variant="secondary"
            className="mr-3"
            onClick={() => rejectLeave({ empId, leaveRequestId })}
            disabled={isRejectingLeave || isApprovingLeave}
          >
            Reject
          </Button>
          <Button
            onClick={() => approveLeave({ leaveRequestId })}
            disabled={isRejectingLeave || isApprovingLeave}
          >
            Approve
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};
