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
import DepartmentTable from "@/components/admin/department/department-table";
import CreateDepartmentForm from "@/components/admin/department/create-department-form";

export default async function DepartmentsPage() {
  await authPage("ADMIN");

  const departments = await api.departmentRouter.getAll();

  return (
    <AdminMainWrapper className="flex gap-3">
      <Card className="h-fit flex-1">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">
            All departments
          </CardTitle>
          <CardDescription>
            Types of departments employee can belong to
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentTable initialData={departments} />
        </CardContent>
      </Card>
      <CreateDepartmentForm />
    </AdminMainWrapper>
  );
}
