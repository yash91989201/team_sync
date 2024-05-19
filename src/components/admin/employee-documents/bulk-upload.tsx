"use client";
import { CommandLoading } from "cmdk";
import { useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
// UTILS
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
// TYPES
import type { BulkUploadEmployeeSelectType } from "@/lib/types";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@ui/command";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { ScrollArea } from "@ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@ui/popover";
// CUSTOM COMPONENTS
import BulkUploadForm from "@adminComponents/employee-documents/bulk-upload-form";
// ICONS
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Check, ChevronsUpDown, CircleX } from "lucide-react";

export default function BulkUpload() {
  const empSelect = useToggle(false);

  const [selectedEmployee, setSelectedEmployee] = useState<
    BulkUploadEmployeeSelectType | undefined
  >(undefined);

  const empNameInputRef = useRef<HTMLInputElement>(null);
  const [debouncedEmpName, setDebounceEmpName] = useDebounceValue<
    string | undefined
  >(undefined, 750);

  const resetEmpNameQuery = () => {
    if (empNameInputRef.current) {
      setDebounceEmpName(undefined);
      empNameInputRef.current.value = "";
    }
  };

  const handleEmployeeSelect = async (empId: string) => {
    const employee = employees.find((emp) => emp.id === empId);
    if (employee === undefined) return;
    setSelectedEmployee(employee);
    empSelect.close();
  };

  const { data: employees = [], isLoading: isEmployeesLoading } =
    api.employeeRouter.getByCodeOrName.useQuery(
      {
        query: debouncedEmpName ?? "",
      },
      {
        staleTime: Infinity,
      },
    );

  const { data: empMissingDocs = [], isLoading } =
    api.documentRouter.getEmployeeMissingDocs.useQuery(
      {
        empId: selectedEmployee?.id ?? "",
      },
      {
        enabled: !!selectedEmployee,
      },
    );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Bulk Upload Documents
          </CardTitle>
          <CardDescription>
            Select an employee to bulk upload their missing documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover open={empSelect.isOpen} onOpenChange={empSelect.toggle}>
            <PopoverTrigger asChild>
              <Button
                role="combobox"
                variant="outline"
                className="w-60 justify-between"
              >
                {selectedEmployee === undefined
                  ? "Select Employee"
                  : selectedEmployee.name}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <Command>
                <div className="flex items-center gap-3 border-b px-3 py-1.5">
                  <MagnifyingGlassIcon className="size-4" />
                  <input
                    className="flex h-9 w-full border-none bg-transparent  py-1 text-sm outline-none  placeholder:text-muted-foreground focus-visible:outline-none"
                    placeholder="Employee name or code"
                    ref={empNameInputRef}
                    onChange={(e) => setDebounceEmpName(e.target.value)}
                  />
                  <CircleX className="size-4" onClick={resetEmpNameQuery} />
                </div>
                <CommandList>
                  {isEmployeesLoading ? (
                    <CommandLoading className="py-3 text-center text-sm text-muted-foreground">
                      Searching Employees...
                    </CommandLoading>
                  ) : (
                    <CommandEmpty>No employee found.</CommandEmpty>
                  )}
                  <CommandGroup className="p-0">
                    <ScrollArea className="h-60 px-3 py-1.5">
                      {employees.map((employee) => (
                        <CommandItem
                          className="my-1.5 flex items-center justify-start gap-3"
                          key={employee.id}
                          value={employee.id}
                          onSelect={handleEmployeeSelect}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedEmployee?.id === employee.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <p className="flex-1">{employee.name}</p>
                          <Badge className="rounded-full" variant="secondary">
                            {employee.code}
                          </Badge>
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </CardContent>
      </Card>

      {selectedEmployee === undefined ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">
              Select an employee to bulk upload their document
            </p>
          </CardContent>
        </Card>
      ) : empMissingDocs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">
              {isLoading
                ? `Fetching document types not added for ${selectedEmployee.name}`
                : "All documents for this employee has been submitted"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
          {empMissingDocs.map((empMissingDoc) => (
            <BulkUploadForm
              key={empMissingDoc.id}
              empId={selectedEmployee?.id ?? ""}
              documentType={empMissingDoc}
            />
          ))}
        </div>
      )}
    </>
  );
}
