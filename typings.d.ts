type FormInitialType<ErrorsType> = {
  status: "UNINITIALIZED";
  errors?: ErrorsType;
  message: string;
};

type FormSuccessType = {
  status: "SUCCESS";
  message: string;
};

type FormFailType<ErrorsType> = {
  status: "FAILED";
  errors?: ErrorsType;
  message: string;
};

type AdminSignupErrorsType = {
  email?: string;
  password?: string;
};

type AdminLoginErrorsType = {
  email?: string;
  password?: string;
};

type NewVerificationErrorsType = {
  token: string;
};

type LoginFormSuccessType = {
  status: "SUCCESS";
  message: string;
  authType: "PASSWORD" | "PASSWORD_WITH_2FA";
  loggedInRedirect: boolean;
  loggedInRoute: string;
};

type NewVerificationStatusType =
  | FormInitialType<NewVerificationErrorsType>
  | FormSuccessType
  | FormFailType<NewVerificationErrorsType>;

type AdminSignupStatusType =
  | FormInitialType<AdminSignupErrorsType>
  | FormSuccessType
  | FormFailType<AdminSignupErrorsType>;

type LoginStatusType =
  | FormInitialType<LoginErrorsType>
  | LoginFormSuccessType
  | FormFailType<LoginErrorsType>;

type AuthCardWrapperProps = {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonHref?: string;
};

type ResetPasswordErrorsType = {
  email?: string;
};

type ResetPasswordStatusType =
  | FormInitialType<ResetPasswordErrorsType>
  | FormSuccessType
  | FormFailType<ResetPasswordErrorsType>;

type UploadProfileImageErrorsType = {
  id: string;
  image: string;
};

type UploadProfileImageSuccessType = {
  status: "SUCCESS";
  message: string;
  imageUrl: string;
};

type UploadProfileImageStatusType =
  | FormInitialType<UploadProfileImageErrorsType>
  | UploadProfileImageSuccessType
  | FormFailType<UploadProfileImageErrorsType>;
