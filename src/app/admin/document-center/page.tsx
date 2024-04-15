// UTILS
import { authPage } from "@/server/helpers";

export default async function DocumentCenterPage() {
  await authPage("ADMIN");

  return <p>document center WIP</p>;
}
