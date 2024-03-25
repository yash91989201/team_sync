"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// ACTIONS
import { adminLogin } from "@/server/actions/auth";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// SCHEMAS
import { AdminLoginSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { AdminLoginSchemaType } from "@/lib/types";
// UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// CUSTOM COMPONENTS
import AuthCardWrapper from "@/components/shared/auth-card-wrapper";
// ICONS
import { Eye, EyeOff, FormInput, Loader2, Mail } from "lucide-react";
// CONSTANTS
import { ADMIN_ROUTES, EMPLOYEE_AUTH_ROUTES } from "@/constants/routes";

export default function EmployeeLoginForm() {
  const showPasswordToggle = useToggle(false);
  const twoFactorAuthenticationField = useToggle(false);
  const router = useRouter();

  const loginForm = useForm<AdminLoginSchemaType>({
    shouldUseNativeValidation: true,
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      twoFactorCode: "",
      role: "ADMIN",
    },
  });
  const { control, handleSubmit, formState } = loginForm;

  const adminLoginAction: SubmitHandler<AdminLoginSchemaType> = async (
    data,
  ) => {
    const actionResponse = await adminLogin(data);
    if (actionResponse.status === "SUCCESS") {
      actionResponse.authType === "PASSWORD_WITH_2FA" &&
        twoFactorAuthenticationField.show();
      if (actionResponse.loggedInRedirect) {
        router.replace(ADMIN_ROUTES.home);
      }
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <AuthCardWrapper headerLabel="Employee Login">
      <Form {...loginForm}>
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit(adminLoginAction)}
        >
          {!twoFactorAuthenticationField.isShowing ? (
            <>
              <FormField
                name="email"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Input
                          {...field}
                          placeholder="Enter your email"
                          type="email"
                        />
                        <Mail />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="password"
                control={control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3 [&>svg]:size-5 md:[&>svg]:size-6">
                        <Input
                          {...field}
                          type={showPasswordToggle.isOn ? "text" : "password"}
                          placeholder="********"
                        />
                        {showPasswordToggle.isOn ? (
                          <Eye
                            className="cursor-pointer select-none"
                            onClick={showPasswordToggle.off}
                          />
                        ) : (
                          <EyeOff
                            className="cursor-pointer select-none"
                            onClick={showPasswordToggle.on}
                          />
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          ) : (
            <FormField
              name="twoFactorCode"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Two Factor Code</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <Input {...field} placeholder="Enter 2FA Code." />
                      <FormInput />
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          )}
          <Button
            className="w-fit px-0 font-normal text-gray-600"
            size="sm"
            asChild
            variant="link"
          >
            <Link href={EMPLOYEE_AUTH_ROUTES.resetPassword}>
              Forgot Password?
            </Link>
          </Button>

          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="mt-3 flex h-12 items-center justify-center gap-3 rounded-full font-medium disabled:cursor-not-allowed"
          >
            <h6 className="md:text-lg">
              {!twoFactorAuthenticationField.isShowing ? "Login" : "Confirm"}
            </h6>
            {formState.isSubmitting && <Loader2 className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
}
