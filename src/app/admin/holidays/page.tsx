// UTILS
import { authPage } from "@/server/helpers";

export default async function HolidaysPage() {
  await authPage("ADMIN");

  return <p>Holidays page WIP</p>;
}
