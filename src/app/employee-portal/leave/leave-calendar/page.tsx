// UTILS
import { authPage } from "@/server/helpers";

export default async function LeaveCalendarPage() {
  await authPage("EMPLOYEE");

  return <>leave calendar page</>;
}
