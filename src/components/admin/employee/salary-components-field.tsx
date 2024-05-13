import { useFieldArray, useFormContext } from "react-hook-form";
// UTILS
import { api } from "@/trpc/react";
import { cn, formatSalary } from "@/lib/utils";
// TYPES
import type { CreateEmployeeFormSchemaType } from "@/lib/types";
// UI
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { generateId } from "lucia";

export default function SalaryComponentsField() {
  const { data: salaryComponents = [] } =
    api.salaryRouter.getComponents.useQuery();

  const { control, getValues, watch, setValue, resetField } =
    useFormContext<CreateEmployeeFormSchemaType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "salaryComponents",
    keyName: "fieldId",
  });

  const selectedSalaryComponents = watch("salaryComponents") ?? [];
  const totalSalary = selectedSalaryComponents.reduce(
    (total, { amount }) => total + amount,
    0,
  );

  setValue("salary", selectedSalaryComponents.length === 0 ? 0 : totalSalary);

  const addSalaryComponent = (
    salaryComponent: CreateEmployeeFormSchemaType["salaryComponents"][0],
  ) => {
    append(salaryComponent);
  };

  const isSalaryComponentSelected = (id: string) => {
    const salaryComponent = fields.find(
      (field) => field.salaryComponent.id === id,
    );
    return salaryComponent === undefined ? false : true;
  };

  const removeSalaryComponent = (id: string) => {
    const fieldValues = getValues("salaryComponents");
    const index = fieldValues.findIndex((fieldValue) => fieldValue.id === id);
    remove(index);
  };

  const resetComponentAmount = (index: number) => {
    resetField(`salaryComponents.${index}.amount`, {
      defaultValue: 0,
    });
  };

  return (
    <FormField
      control={control}
      name="salaryComponents"
      render={() => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Salary Component</TableHead>
              <TableHead className="w-44 text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map(({ salaryComponent }, index) => (
              <TableRow key={index} className="hover:bg-white">
                <TableCell>
                  <FormLabel>{salaryComponent.name}</FormLabel>
                </TableCell>
                <TableCell>
                  <FormField
                    control={control}
                    name={`salaryComponents.${index}.amount`}
                    render={({ field }) => (
                      <FormItem className="flex items-end gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          type="button"
                          className="flex-shrink-0 text-gray-600"
                          onClick={() => resetComponentAmount(index)}
                        >
                          <RotateCw className="size-4" />
                        </Button>
                        <FormControl>
                          <Input
                            {...field}
                            min={0}
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
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Total</TableCell>
              <TableCell className="text-right">
                {formatSalary(totalSalary)}
              </TableCell>
            </TableRow>
          </TableFooter>
          <TableCaption className="space-y-3">
            <p className="text-left">Add salary components and their values</p>
            <div className="flex-flow flex gap-1">
              {salaryComponents.map(({ id, name }, index) => (
                <Button
                  key={index}
                  type="button"
                  className={cn(
                    isSalaryComponentSelected(id)
                      ? "border-primary text-primary"
                      : "",
                  )}
                  variant="outline"
                  onClick={() => {
                    isSalaryComponentSelected(id)
                      ? removeSalaryComponent(id)
                      : addSalaryComponent({
                          id: generateId(15),
                          amount: 0,
                          salaryComponent: { id, name },
                        });
                  }}
                >
                  {name}
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
