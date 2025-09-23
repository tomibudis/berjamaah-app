export interface User {
  id: string;
  name: string | null;
  email: string;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  status: 'scheduled' | 'pending' | 'active';
  createdAt: string; // Serialized date from tRPC
  updatedAt: string; // Serialized date from tRPC
  totalDonations?: number;
  totalAmount?: number;
}

export interface UserFilters extends Record<string, unknown> {
  search: string;
  status: 'all' | 'scheduled' | 'pending' | 'active';
  role: 'all' | 'admin' | 'user';
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  phone?: string;
}

// Note: UsersResponse type is now automatically inferred from tRPC router
// No need to manually define it since tRPC provides full type safety
