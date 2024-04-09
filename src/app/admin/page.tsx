// UTILS
import { authPage } from "@/server/helpers";

export default async function AdminPage() {
  await authPage("ADMIN");
  return <div>admin page</div>;
}
