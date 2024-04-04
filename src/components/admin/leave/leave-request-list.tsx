"use client";
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
} from "@/components/ui/card";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const { id, employee, leaveType, fromDate, toDate, leaveDays, status } =
    leaveRequest;

  const { mutateAsync: updateLeaveStatus } =
    api.leaveRouter.updateLeaveStatus.useMutation();

  const acceptLeave = async () => {
    await updateLeaveStatus({
      empId: employee.id,
      status: "approved",
      id,
      leaveDays,
      leaveType,
    });
  };
  const rejectLeave = async () => {
    await updateLeaveStatus({
      empId: employee.id,
      status: "rejected",
      id,
      leaveDays,
      leaveType,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{employee.name}</CardTitle>
        <CardDescription>{leaveType.type}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          {format(fromDate, "dd/mm/yyyy")} &minus;{" "}
          {format(toDate, "dd/mm/yyyy")}
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
          <Button variant="secondary" className="mr-3" onClick={rejectLeave}>
            Reject
          </Button>
          <Button onClick={acceptLeave}>Accept</Button>
        </CardFooter>
      ) : null}
    </Card>
  );
};
