const API_BASE = import.meta.env.VITE_API_URL || '/api';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem('honeytrace_access');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('honeytrace_refresh');
}

export function setTokens(access: string, refresh: string): void {
  localStorage.setItem('honeytrace_access', access);
  localStorage.setItem('honeytrace_refresh', refresh);
}

export function clearTokens(): void {
  localStorage.removeItem('honeytrace_access');
  localStorage.removeItem('honeytrace_refresh');
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.access) {
      localStorage.setItem('honeytrace_access', data.access);
      if (data.refresh) localStorage.setItem('honeytrace_refresh', data.refresh);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers: Record<string, string> = {
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
    });
  } catch (error) {
    throw new ApiError(
      'Cannot reach the server. Keep the backend running and make sure its dependencies are installed.',
      0,
      error,
    );
  }

  if (res.status === 401 && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) return apiRequest<T>(path, options, false);
    clearTokens();
    throw new ApiError('Session expired. Please log in again.', 401);
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const errData = data as Record<string, unknown>;
    const isGatewayError = [502, 503, 504].includes(res.status);
    const message =
      (isGatewayError
        ? 'Cannot reach the server. Keep the backend running and make sure its dependencies are installed.'
        : null) ||
      (errData?.error as string) ||
      (errData?.detail as string) ||
      (typeof errData === 'object' && errData !== null
        ? Object.entries(errData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
            .join('; ')
        : null) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export function unwrapList<T>(data: T[] | { results: T[] }): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data) return data.results;
  return [];
}
