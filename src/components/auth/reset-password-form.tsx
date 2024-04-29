"use client";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
// ACTIONS
import { resetPassword } from "@/server/actions/auth";
// SCHEMAS
import { ResetPasswordSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { ResetPasswordSchemaType, UserType } from "@/lib/types";
// UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@ui/form";
import { Input } from "@ui/input";
import { Button } from "@ui/button";
// ICONS
import { Loader2, Mail } from "lucide-react";
// CONSTANTS
import { ADMIN_AUTH_ROUTES, EMPLOYEE_AUTH_ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import AuthCardWrapper from "../shared/auth-card-wrapper";

export default function ResetPasswordForm({
  role,
}: {
  role: UserType["role"];
}) {
  const router = useRouter();
  const logInRoute =
    role === "ADMIN" ? ADMIN_AUTH_ROUTES.logIn : EMPLOYEE_AUTH_ROUTES.logIn;

  const signInForm = useForm<ResetPasswordSchemaType>({
    shouldUseNativeValidation: true,
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });
  const { control, handleSubmit, formState } = signInForm;

  const resetPasswordAction: SubmitHandler<ResetPasswordSchemaType> = async (
    data,
  ) => {
    const actionResponse = await resetPassword(data);
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
      setTimeout(() => {
        router.replace(logInRoute);
      }, 3000);
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <AuthCardWrapper
      headerLabel="Reset Password"
      backButtonLabel="Log In to your account"
      backButtonHref={logInRoute}
    >
      <Form {...signInForm}>
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit(resetPasswordAction)}
        >
          <FormField
            name="email"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input {...field} placeholder="Enter your email" />
                    <Mail />
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex items-center justify-center gap-3 disabled:cursor-not-allowed"
          >
            <h6 className="md:text-lg">Send Reset Email</h6>
            {formState.isSubmitting && <Loader2 className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
}
