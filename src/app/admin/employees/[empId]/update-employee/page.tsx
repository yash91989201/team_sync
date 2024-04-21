// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import UpdateEmployeeForm from "@/components/admin/employee/update-employee-form";

export default async function UpdateEmployeePage({
  params,
}: {
  params: { empId: string };
}) {
  await authPage("ADMIN");

  return (
    <AdminMainWrapper>
      <div className="mx-auto max-w-7xl">
        <UpdateEmployeeForm />
      </div>
    </AdminMainWrapper>
  );
}
