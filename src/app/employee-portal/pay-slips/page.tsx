// UTILS
import { authPage } from "@/server/helpers";

export default async function PaySlipsPage() {
  await authPage("EMPLOYEE");

  return <>pay slips page WIP</>;
}
