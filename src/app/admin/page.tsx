// UTILS
import { authPage } from "@/server/helpers";

export default async function AdminPage() {
  await authPage("ADMIN");

  return <div className="p-6">admin page</div>;
}
