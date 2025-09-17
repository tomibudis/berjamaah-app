"use client";

import * as React from "react";
import { useQueryParams } from "@/hooks/use-query-params";
import { MOCK_USERS } from "./data";
import { User, UserFilters, CreateUserData } from "./types";
import {
  UsersHeader,
  UsersGrid,
  SearchInput,
  StatusSelect,
  RoleSelect,
  FiltersTable,
  CreateUserForm,
} from "./components";

export default function UsersPage() {
  // URL State Management
  const [queryParams, setQueryParams] = useQueryParams<UserFilters>({
    search: "",
    status: "all",
    role: "all",
    page: "1",
  });

  // Local state for users data
  const [users, setUsers] = React.useState<User[]>(() => MOCK_USERS);
  const [isCreateFormOpen, setIsCreateFormOpen] = React.useState(false);

  // Filter users based on query parameters
  const filteredUsers = React.useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        queryParams.search === "" ||
        user.name.toLowerCase().includes(queryParams.search.toLowerCase()) ||
        user.email.toLowerCase().includes(queryParams.search.toLowerCase());

      const matchesStatus =
        queryParams.status === "all" || user.status === queryParams.status;
      const matchesRole =
        queryParams.role === "all" || user.role === queryParams.role;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, queryParams]);

  // Calculate stats
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === "active").length;

  // Filter handlers
  const handleSearch = (value: string) => {
    setQueryParams({ search: value, page: "1" });
  };

  const handleStatusFilter = (value: string) => {
    setQueryParams({
      status: value as "all" | "active" | "inactive" | "pending",
      page: "1",
    });
  };

  const handleRoleFilter = (value: string) => {
    setQueryParams({ role: value as "all" | "admin" | "user", page: "1" });
  };

  // User actions
  const handleCreateUser = () => {
    setIsCreateFormOpen(true);
  };

  const handleCreateUserSubmit = (data: CreateUserData) => {
    const newUser: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      role: data.role,
      status: "active",
      createdAt: new Date().toISOString(),
      phone: data.phone,
      totalDonations: 0,
      totalAmount: 0,
    };

    setUsers((prev) => [newUser, ...prev]);
    setIsCreateFormOpen(false);
  };

  const handleEditUser = (user: User) => {
    // TODO: Implement edit user functionality
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user: User) => {
    // TODO: Implement delete user functionality
    console.log("Delete user:", user);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 px-4 py-6 lg:px-6">
          <UsersHeader
            onCreateUser={handleCreateUser}
            totalUsers={totalUsers}
            activeUsers={activeUsers}
          />
          <FiltersTable>
            <SearchInput value={queryParams.search} onChange={handleSearch} />
            <StatusSelect
              value={queryParams.status}
              onChange={handleStatusFilter}
            />
            <RoleSelect value={queryParams.role} onChange={handleRoleFilter} />
          </FiltersTable>
        </div>
        <div className="flex-1 px-4 lg:px-6 pb-6">
          <UsersGrid
            users={filteredUsers}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
          />
        </div>
      </div>

      <CreateUserForm
        isOpen={isCreateFormOpen}
        onClose={() => setIsCreateFormOpen(false)}
        onSubmit={handleCreateUserSubmit}
      />
    </div>
  );
}
