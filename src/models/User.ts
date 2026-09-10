export type UserRole = 'beekeeper' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  apiaryName?: string;
  location?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  loginAt: string;
}
