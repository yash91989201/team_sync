// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import CreateEmployeeForm from "@/components/admin/employee/create-employee-form";

export default async function NewEmployee() {
  await authPage("ADMIN");

  return <CreateEmployeeForm />;
}
