import { User, columns } from "./columns";
import { DataTable } from "./data-table";
import { adminApi, AdminUser } from "../../lib/api-client";

const getData = async (): Promise<User[]> => {
  try {
    const result = await adminApi.getUsers();
    if (result.success && result.users.length > 0) {
      return result.users.map((u: AdminUser) => ({
        id: u.id,
        avatar: u.picture || "/users/default.png",
        fullName: u.name,
        email: u.email,
        roles: u.roles,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }

  return [];
};

const UsersPage = async () => {
  const data = await getData();
  return (
    <div className="">
      <div className="mb-8 px-4 py-2 bg-secondary rounded-md">
        <h1 className="font-semibold">All Users</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
};

export default UsersPage;
