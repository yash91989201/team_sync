// UTILS
import { authPage, getUser } from "@/server/helpers";
//
import EmployeeMainWrapper from "@empComponents/layouts/employee-main-wrapper";
import PayslipData from "@empComponents/payslips/payslip-data";

export default async function PaySlipsPage() {
  await authPage("EMPLOYEE");
  const { user } = await getUser();

  return (
    <EmployeeMainWrapper>
      <PayslipData empId={user.id} />
    </EmployeeMainWrapper>
  );
}
