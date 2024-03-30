import { api } from "@/trpc/server";

export default async function EmployeeList() {
  const employeeList = await api.employeeRouter.getAll();

  return (
    <>
      <h2 className="text-lg font-semibold">Employee List</h2>
      {employeeList.map((employee) => (
        <div key={employee.id}>
          <p>{employee.name}</p>
          <p>{employee.email}</p>
        </div>
      ))}
    </>
  );
}
