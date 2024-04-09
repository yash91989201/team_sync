// CUSTOM COMPONENTS
import DesignationList from "@/components/admin/designation/designation-list";
import CreateDesignationForm from "@/components/admin/designation/create-designation-form";

export default function DesignationPage() {
  return (
    <>
      <CreateDesignationForm />
      <DesignationList />
    </>
  );
}
