"use client";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
// UTILS
import { api } from "@/trpc/react";
// SCHEMAS
import { GeneratePayslipSchema } from "@/lib/schema";
// TYPES
import type {
  GeneratePayslipFormProps,
  GeneratePayslipSchemaType,
} from "@/lib/types";
import type { SubmitHandler } from "react-hook-form";
// UI
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// ICONS
import {
  Calendar,
  CalendarCheck2,
  CalendarDays,
  CalendarMinus,
  CalendarOff,
  HandCoins,
} from "lucide-react";

export default function GeneratePayslipForm({
  empId,
  date,
  payslipData,
}: GeneratePayslipFormProps) {
  const { mutateAsync: createEmployeePayslip } =
    api.adminRouter.createEmployeePayslip.useMutation();

  const generatePayslipForm = useForm<GeneratePayslipSchemaType>({
    resolver: zodResolver(GeneratePayslipSchema),
    defaultValues: {
      empId,
      leaveEncashment: payslipData.leaveEncashmentData,
      payslipComponents: payslipData.empPayslipComponents,
      createdAt: new Date(),
      date,
      calendarDays: payslipData.calendarDays,
      daysPayable: payslipData.daysPayable,
      lopDays: payslipData.lopDays,
      totalSalary: payslipData.totalSalary,
    },
  });

  const { control, handleSubmit, watch } = generatePayslipForm;

  const componentsData = watch("payslipComponents");
  const leaveEncashmentAdjustment = watch("leaveEncashment.adjustment");
  const leaveEncashmentArrear = watch("leaveEncashment.arrear");

  const leaveEncashmentAmountPaid =
    leaveEncashmentAdjustment +
    leaveEncashmentArrear +
    payslipData.leaveEncashmentData.amount;

  const totalSalary =
    componentsData.reduce(
      (total, { amountPaid, adjustment, arrear }) =>
        total + amountPaid + adjustment + arrear,
      0,
    ) + leaveEncashmentAmountPaid;

  const generatePayslipAction: SubmitHandler<
    GeneratePayslipSchemaType
  > = async (data) => {
    const finalPayslipComponents = data.payslipComponents.map(
      (payslipComp) => ({
        ...payslipComp,
        amountPaid:
          payslipComp.amountPaid + payslipComp.adjustment + payslipComp.arrear,
      }),
    );

    const leaveEncashmentAmount = data.leaveEncashment.amount;
    const leaveEncashmentAdjustment = data.leaveEncashment.adjustment;
    const leaveEncashmentArrear = data.leaveEncashment.arrear;

    const leaveEncashmentAmountPaid =
      leaveEncashmentAmount + leaveEncashmentAdjustment + leaveEncashmentArrear;

    const totalSalary =
      data.payslipComponents.reduce(
        (total, { amountPaid, adjustment, arrear }) =>
          total + amountPaid + adjustment + arrear,
        0,
      ) + data.leaveEncashment.amountPaid;

    const actionResponse = await createEmployeePayslip({
      ...data,
      leaveEncashment: {
        amount: leaveEncashmentAmount,
        adjustment: leaveEncashmentAdjustment,
        arrear: leaveEncashmentArrear,
        amountPaid: leaveEncashmentAmountPaid,
      },
      totalSalary,
      payslipComponents: finalPayslipComponents,
    });
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <Form {...generatePayslipForm}>
      <form
        className="space-y-3"
        onSubmit={handleSubmit(generatePayslipAction)}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salary Component</TableHead>
              <TableHead>Comp Master</TableHead>
              <TableHead className="w-40">Adjustment</TableHead>
              <TableHead className="w-40">Arrears</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <SalaryComponentsField />
            <TableRow className="hover:bg-white">
              <TableCell>Leave encashment</TableCell>
              <TableCell>{payslipData.leaveEncashmentData.amount}</TableCell>
              <TableCell>
                <FormField
                  control={control}
                  name="leaveEncashment.adjustment"
                  render={({ field }) => (
                    <FormItem className="flex items-end gap-3">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="amount"
                          className="hide-input-spinner bg-white"
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>
                <FormField
                  control={control}
                  name="leaveEncashment.arrear"
                  render={({ field }) => (
                    <FormItem className="flex items-end gap-3">
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="amount"
                          className="hide-input-spinner bg-white"
                          onChange={(event) =>
                            field.onChange(Number(event.target.value))
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TableCell>
              <TableCell>{leaveEncashmentAmountPaid}</TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={4} className="text-lg font-semibold">
                Total
              </TableCell>
              <TableCell colSpan={2} className="text-lg font-semibold">
                Rs.&nbsp;{totalSalary}
              </TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption className="space-y-3">
            <p className="text-left">
              Adjust component values then generate payslip.
            </p>
            <FormMessage className="text-left" />
          </TableCaption>
        </Table>
        <div className="space-y-1.5 text-gray-600">
          <p className="text-base font-medium text-gray-600">Additional Info</p>
          <div className="grid grid-cols-4 gap-3 text-base ">
            <p className="flex items-center justify-between gap-3 rounded-lg bg-blue-100 p-3 text-blue-600">
              <Calendar className="size-4" />
              <span className="flex-1">Calendar Days</span>
              <span className="font-semibold">{payslipData.calendarDays}</span>
            </p>
            <p className="flex items-center justify-between gap-3 rounded-lg bg-green-100 p-3 text-green-600">
              <HandCoins className="size-4" />
              <span className="flex-1">Days Payable</span>
              <span className="font-semibold">{payslipData.daysPayable}</span>
            </p>
            <p className="flex items-center justify-between gap-3 rounded-lg bg-orange-100 p-3 text-orange-600">
              <CalendarMinus className="size-4" />
              <span className="flex-1">LOP Days</span>
              <span className="font-semibold">{payslipData.lopDays}</span>
            </p>
            <p className="flex items-center justify-between gap-3 rounded-lg bg-pink-100 p-3 text-pink-600">
              <CalendarCheck2 className="size-4" />
              <span className="flex-1">Present Days</span>
              <span className="font-semibold">{payslipData.presentDays}</span>
            </p>
            <p className="flex items-center justify-between gap-3 rounded-lg bg-fuchsia-100 p-3 text-fuchsia-600">
              <CalendarDays className="size-4" />
              <span className="flex-1">Paid Leave Days</span>
              <span className="font-semibold">{payslipData.paidLeaveDays}</span>
            </p>
            <p className="rounded-mg flex items-center justify-between gap-3 rounded-lg bg-violet-100 p-3 text-violet-600">
              <CalendarOff className="size-4" />
              <span className="flex-1">Holidays</span>
              <span className="font-semibold">{payslipData.holidays}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <Button className="font-semibold">Generate Payslip</Button>
        </div>
      </form>
    </Form>
  );
}

const SalaryComponentsField = () => {
  const { control } = useFormContext<GeneratePayslipSchemaType>();
  const { fields } = useFieldArray({
    control,
    name: "payslipComponents",
    keyName: "fieldId",
  });

  return (
    <>
      {fields.map((field, index) => (
        <SalaryComponentField key={index} index={index} field={field} />
      ))}
    </>
  );
};

const SalaryComponentField = ({
  index,
  field,
}: {
  index: number;
  field: GeneratePayslipSchemaType["payslipComponents"][0];
}) => {
  const { control, watch, getValues } =
    useFormContext<GeneratePayslipSchemaType>();
  const amountPaid = getValues(`payslipComponents.${index}.amountPaid`);
  const adjustment = watch(`payslipComponents.${index}.adjustment`);
  const arrear = watch(`payslipComponents.${index}.arrear`);
  const totalAmountPaid = amountPaid + adjustment + arrear;

  return (
    <TableRow key={index} className="hover:bg-white">
      <TableCell>{field.name}</TableCell>
      <TableCell>{field.amount}</TableCell>
      {/* adjustment input cell */}
      <TableCell>
        <FormField
          control={control}
          name={`payslipComponents.${index}.adjustment`}
          render={({ field }) => (
            <FormItem className="flex items-end gap-3">
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="amount"
                  className="hide-input-spinner bg-white"
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
      {/* arrear input cell */}
      <TableCell>
        <FormField
          control={control}
          name={`payslipComponents.${index}.arrear`}
          render={({ field }) => (
            <FormItem className="flex items-end gap-3">
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  placeholder="amount"
                  className="hide-input-spinner bg-white"
                  onChange={(event) =>
                    field.onChange(Number(event.target.value))
                  }
                />
              </FormControl>
            </FormItem>
          )}
        />
      </TableCell>
      <TableCell>{totalAmountPaid}</TableCell>
    </TableRow>
  );
};
