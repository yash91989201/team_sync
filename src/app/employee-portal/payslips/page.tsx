// UTILS
import { authPage, getUser } from "@/server/helpers";
import { api } from "@/trpc/server";
//
import EmployeeMainWrapper from "@empComponents/layouts/employee-main-wrapper";
import PayslipData from "@empComponents/payslips/payslip-data";

export default async function PaySlipsPage() {
  await authPage("EMPLOYEE");
  const { user } = await getUser();
  const data = await api.employeeRouter.getData();

  return (
    <EmployeeMainWrapper>
      <PayslipData
        empId={user.id}
        joiningDate={data?.joiningDate ?? new Date()}
      />
    </EmployeeMainWrapper>
  );
}
