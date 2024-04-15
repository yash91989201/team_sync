// UTILS
import { authPage } from "@/server/helpers";
// CUSTOM COMPONENTS
import DesignationList from "@/components/admin/designation/designation-list";
import CreateDesignationForm from "@/components/admin/designation/create-designation-form";

export default async function DesignationPage() {
  await authPage("ADMIN");

  return (
    <>
      <CreateDesignationForm />
      <DesignationList />
    </>
  );
}
