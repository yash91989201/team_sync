// UTILS
import { api } from "@/trpc/server";
import { authPage } from "@/server/helpers";
// UI
import { Card, CardContent, CardHeader, CardTitle } from "@ui//card";

export default async function LeaveApplyPage() {
  await authPage("EMPLOYEE");
  const employeeLeaveBalances = await api.leaveRouter.getLeaveBalances();
  return (
    <div>
      {employeeLeaveBalances.map(({ id, balance, leaveType }) => (
        <Card key={id}>
          <CardHeader>
            <CardTitle>{leaveType.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              {balance}/{leaveType.daysAllowed}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
