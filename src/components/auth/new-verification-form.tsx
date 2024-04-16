"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
// ACTIONS
import { newVerification } from "@/server/actions/auth";
// SCHEMAS
import { NewVerificationSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { NewVerificationSchemaType, UserType } from "@/lib/types";
// UI
import { Form } from "@ui/form";
import { Button } from "@ui/button";
// CUSTOM COMPONENTS
import AuthCardWrapper from "@sharedComponents/auth-card-wrapper";
// ICONS
import { Loader2 } from "lucide-react";
// CONSTANTS
import { ADMIN_AUTH_ROUTES, EMPLOYEE_AUTH_ROUTES } from "@/constants/routes";

export default function NewAdminVerificationForm({
  role,
}: {
  role: UserType["role"];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") ?? "";
  const logInRoute =
    role === "ADMIN" ? ADMIN_AUTH_ROUTES.logIn : EMPLOYEE_AUTH_ROUTES.logIn;

  const newVerificationForm = useForm({
    resolver: zodResolver(NewVerificationSchema),
    defaultValues: { token },
  });

  const { handleSubmit, formState } = newVerificationForm;

  const newVerificationAction: SubmitHandler<
    NewVerificationSchemaType
  > = async (formData) => {
    const actionResponse = await newVerification(formData);
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      setTimeout(() => {
        router.replace(logInRoute);
      }, 3000);
    }
    if (actionResponse.status === "FAILED") {
      toast.error(actionResponse.message);
    }
  };

  return (
    <AuthCardWrapper
      headerLabel="Email Verification"
      backButtonHref={logInRoute}
      backButtonLabel="Log In to your account."
    >
      <Form {...newVerificationForm}>
        <form
          className="space-y-3"
          onSubmit={handleSubmit(newVerificationAction)}
        >
          <Button className="flex w-full items-center justify-center gap-3 text-lg font-medium">
            <span>Verify Email</span>
            {formState.isSubmitting && <Loader2 className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
}
