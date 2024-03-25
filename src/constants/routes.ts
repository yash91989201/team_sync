/* 
Auth routes configuration for admin
*/
export const ADMIN_AUTH_ROUTES = {
  signUp: "/auth/admin/sign-up",
  logIn: "/auth/admin/log-in",
  newverification: "/auth/admin/new-verification",
  resetPassword: "/auth/admin/reset-password",
};
/*
Auth routes configuration for employee 
*/
export const EMPLOYEE_AUTH_ROUTES = {
  logIn: "/",
  newVerification: "/auth/employee/new-verification",
  resetPassword: "/auth/employee/reset-password",
};

/*
Configuration for routes are accessible to admins 
*/
export const ADMIN_ROUTES = {
  home: "/admin",
};
/*
Configuration for routes are accessible to employees
*/
export const EMPLOYEE_ROUTES = {
  home: "/employee-portal",
};
