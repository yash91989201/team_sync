// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import Attendance from "@adminComponents/dashboard/attendance";

export default async function AdminPage() {
  await authPage("ADMIN");

  return (
    <div className="p-6">
      <Attendance />
    </div>
  );
}
