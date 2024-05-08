import { api } from "@/trpc/server";
// UTILS
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
import GeneratePayslip from "@/components/admin/payroll/generate-payslip";

export default async function GeneratePayslipPage({
  params,
}: {
  params: { empId: string };
}) {
  await authPage("ADMIN");

  const employeeData = await api.adminRouter.getEmployeeData({
    empId: params.empId,
  });

  if (employeeData.status === "SUCCESS") {
    return (
      <AdminMainWrapper>
        <div className="mx-auto max-w-7xl">
          <GeneratePayslip empId={params.empId} />
        </div>
      </AdminMainWrapper>
    );
  }

  return (
    <AdminMainWrapper>
      <div className="mx-auto max-w-7xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">
              Employee with id - {params.empId} was not found !!
            </CardTitle>
            <CardDescription>
              This can happen because of the following reasons.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol>
              <li>
                Employee may have been removed by other admin or someone with
                appropriate access control.
              </li>
              <li>This may be a shared url which might be incorrect.</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </AdminMainWrapper>
  );
}
