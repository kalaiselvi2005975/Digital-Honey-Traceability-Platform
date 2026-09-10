import { User, UserRole } from '../models/User';
import { apiRequest, setTokens, clearTokens, unwrapList } from './api';

interface ApiUser {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  apiary_name?: string;
  location?: string;
  created_at: string;
  updated_at?: string;
}

export function mapUser(u: ApiUser): User {
  const roleMap: Record<string, UserRole> = {
    BEEKEEPER: 'beekeeper',
    CUSTOMER: 'customer',
    ADMIN: 'beekeeper',
  };
  return {
    id: String(u.id),
    email: u.email,
    name: u.name,
    role: roleMap[u.role] || 'customer',
    apiaryName: u.apiary_name,
    location: u.location,
    createdAt: u.created_at,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; access: string; refresh: string }> {
    const data = await apiRequest<{
      access: string;
      refresh: string;
      user: ApiUser;
    }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.access, data.refresh);
    return { user: mapUser(data.user), access: data.access, refresh: data.refresh };
  },

  async register(payload: {
    email: string;
    password: string;
    password_confirm: string;
    name: string;
    role?: string;
    apiary_name?: string;
    location?: string;
  }): Promise<User> {
    const data = await apiRequest<ApiUser>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapUser(data);
  },

  async me(): Promise<User> {
    const data = await apiRequest<ApiUser>('/auth/me/');
    return mapUser(data);
  },

  logout(): void {
    clearTokens();
  },
};
