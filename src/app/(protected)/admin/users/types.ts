export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
  phone?: string;
  totalDonations?: number;
  totalAmount?: number;
}

export interface UserFilters extends Record<string, unknown> {
  search: string;
  status: 'all' | 'active' | 'inactive' | 'pending';
  role: 'all' | 'admin' | 'user';
  page: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  phone?: string;
}
