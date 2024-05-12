// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import Attendance from "@/components/admin/dashboard/attendance";

export default async function AdminPage() {
  await authPage("ADMIN");

  return (
    <div className="p-6">
      <Attendance />
    </div>
  );
}
