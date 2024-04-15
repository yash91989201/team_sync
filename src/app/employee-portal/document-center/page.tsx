// UTILS
import { authPage } from "@/server/helpers";

export default async function DocumentCenterpage() {
  await authPage("EMPLOYEE");

  return <>Document center page WIP</>;
}
