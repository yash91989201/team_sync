// UTILS
import { api } from "@/trpc/server";
import { authPage } from "@/server/helpers";
// UI
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import SalaryComponentTable from "@/components/admin/payroll/salary-component-table";
import CreateSalaryComponentForm from "@/components/admin/payroll/create-salary-component-form";

export default async function SalaryComponentsPage() {
  await authPage("ADMIN");

  const salaryComponents = await api.salaryRouter.getComponents();

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            Salary Components
          </CardTitle>
          <CardDescription>
            salary components that are applicable for employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalaryComponentTable initialData={salaryComponents} />
        </CardContent>
      </Card>
      <CreateSalaryComponentForm />
    </AdminMainWrapper>
  );
}
