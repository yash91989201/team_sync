// UTILS
import { authPage } from "@/server/helpers";

export default async function SalariesPage() {
  await authPage("ADMIN");

  return <p>salaries page WIP</p>;
}
