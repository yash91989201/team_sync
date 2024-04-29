import { useFieldArray, useFormContext } from "react-hook-form";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// TYPES
import type { CreateEmployeeFormSchemaType } from "@/lib/types";
// UI
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormField, FormLabel, FormMessage } from "@/components/ui/form";

export default function LeaveTypesField() {
  const { data: leaveTypes = [] } = api.leaveRouter.getLeaveTypes.useQuery();

  const { control, getValues } = useFormContext<CreateEmployeeFormSchemaType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "leaveTypes",
    keyName: "fieldId",
  });

  const addLeaveType = (
    leaveType: CreateEmployeeFormSchemaType["leaveTypes"][0],
  ) => {
    append(leaveType);
  };

  const isLeaveTypeSelected = (id: string) => {
    const salaryComponent = fields.find((field) => field.id === id);
    return salaryComponent === undefined ? false : true;
  };

  const removeLeaveType = (id: string) => {
    const fieldValues = getValues("leaveTypes");
    const index = fieldValues.findIndex((fieldValue) => fieldValue.id === id);
    remove(index);
  };

  return (
    <FormField
      control={control}
      name="leaveTypes"
      render={() => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leave types</TableHead>
              <TableHead>Renew every</TableHead>
              <TableHead>Paid leave</TableHead>
              <TableHead>Carry over</TableHead>
              <TableHead>Leave encashment</TableHead>
              <TableHead>Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map(
              (
                {
                  type,
                  carryOver,
                  paidLeave,
                  daysAllowed,
                  leaveEncashment,
                  renewPeriod,
                  renewPeriodCount,
                },
                index,
              ) => (
                <TableRow key={index} className="hover:bg-white">
                  <TableCell>
                    <FormLabel>{type}</FormLabel>
                  </TableCell>
                  <TableCell>
                    {renewPeriodCount > 1
                      ? `${renewPeriodCount} ${renewPeriod}s`
                      : renewPeriod}
                  </TableCell>
                  <TableCell>
                    <FormLabel>{paidLeave ? "yes" : "no"}</FormLabel>
                  </TableCell>
                  <TableCell>
                    <FormLabel>{carryOver ? "yes" : "no"}</FormLabel>
                  </TableCell>
                  <TableCell>
                    <FormLabel>{leaveEncashment ? "yes" : "no"}</FormLabel>
                  </TableCell>
                  <TableCell>
                    <FormLabel>{daysAllowed}</FormLabel>
                  </TableCell>
                </TableRow>
              ),
            )}
          </TableBody>
          <TableCaption className="space-y-3">
            <p className="text-left">Add leave types</p>
            <div className="flex-flow flex gap-1">
              {leaveTypes.map((leaveType, index) => (
                <Button
                  key={index}
                  type="button"
                  className={cn(
                    isLeaveTypeSelected(leaveType.id)
                      ? "border-primary text-primary"
                      : "",
                  )}
                  variant="outline"
                  onClick={() => {
                    isLeaveTypeSelected(leaveType.id)
                      ? removeLeaveType(leaveType.id)
                      : addLeaveType(leaveType);
                  }}
                >
                  {leaveType.type}
                </Button>
              ))}
            </div>
            <FormMessage className="text-left" />
          </TableCaption>
        </Table>
      )}
    />
  );
}
