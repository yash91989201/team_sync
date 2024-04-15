"use client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
// ACTIONS
import { adminSignup } from "@/server/actions/auth";
// CUSTOM HOOKS
import useToggle from "@/hooks/use-toggle";
// SCHEMAS
import { AdminSignupSchema } from "@/lib/schema";
// TYPES
import type { SubmitHandler } from "react-hook-form";
import type { AdminSignupSchemaType } from "@/lib/types";
// UI
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ui//form";
import { Input } from "@ui//input";
import { Button } from "@ui//button";
// CUSTOM COMPONENTS
import AuthCardWrapper from "@sharedComponents/auth-card-wrapper";
// ICONS
import { Eye, EyeOff, Loader2, Mail, UserRound } from "lucide-react";
// CONSTANTS
import { ADMIN_AUTH_ROUTES } from "@/constants/routes";

export default function AdminSignupForm() {
  const showPasswordToggle = useToggle(false);

  const adminSignupForm = useForm<AdminSignupSchemaType>({
    shouldUseNativeValidation: true,
    resolver: zodResolver(AdminSignupSchema),
  });
  const { control, handleSubmit, formState } = adminSignupForm;

  const adminSigninAction: SubmitHandler<AdminSignupSchemaType> = async (
    data,
  ) => {
    const actionResponse = await adminSignup(data);
    if (actionResponse.status === "SUCCESS") {
      toast.success(actionResponse.message);
    } else {
      toast.error(actionResponse.message);
    }
  };

  return (
    <AuthCardWrapper
      headerLabel="New Admin Account"
      backButtonLabel="Already have an account?"
      backButtonHref={ADMIN_AUTH_ROUTES.logIn}
    >
      <Form {...adminSignupForm}>
        <form
          className="flex flex-col gap-3"
          onSubmit={handleSubmit(adminSigninAction)}
        >
          <FormField
            name="name"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input {...field} placeholder="Enter name" type="text" />
                    <UserRound />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormMessage />
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
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex items-center justify-center gap-3 disabled:cursor-not-allowed"
          >
            <h6 className="md:text-lg">Sign Up</h6>
            {formState.isSubmitting && <Loader2 className="animate-spin" />}
          </Button>
        </form>
      </Form>
    </AuthCardWrapper>
  );
}
