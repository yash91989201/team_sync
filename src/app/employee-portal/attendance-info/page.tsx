// UTILS
import { authPage } from "@/server/helpers";

export default async function AttendanceInfoPage() {
  await authPage("EMPLOYEE");

  return <>attendance info page WIP</>;
}
