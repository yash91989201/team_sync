// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import AdminMainWrapper from "@/components/admin/admin-main-wrapper";
import CreateEmployeeForm from "@/components/admin/employee/create-employee-form";

export default async function NewEmployee() {
  await authPage("ADMIN");

  return (
    <AdminMainWrapper>
      <div className="mx-auto max-w-7xl">
        <CreateEmployeeForm />
      </div>
    </AdminMainWrapper>
  );
}
