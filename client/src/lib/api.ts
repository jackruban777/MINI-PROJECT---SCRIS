export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string = 'API_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');

export const setAuthToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('scris_auth_token', token);
  }
};

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('scris_auth_token');
  }
  return null;
};

export const clearAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('scris_auth_token');
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}/api/v1${path}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include HTTP-only cookies
  });

  const contentType = response.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType.includes('application/pdf') || contentType.includes('text/csv')) {
    // Return blob for file downloads
    return (await response.blob()) as unknown as T;
  } else {
    data = await response.text();
    // Guard against SPA fallback where static host serves index.html instead of hitting API
    if (typeof data === 'string' && (data.trim().startsWith('<!DOCTYPE html') || data.trim().startsWith('<html') || data.trim().startsWith('<!doctype'))) {
      throw new ApiError(
        'Backend API unreachable (received HTML from static host). Please configure VITE_API_URL in your frontend deployment to point to your backend service URL (e.g. https://scris-backend.onrender.com).',
        'API_URL_NOT_CONFIGURED'
      );
    }
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const code = data?.error?.code || 'UNKNOWN_ERROR';
    const details = data?.error?.details;
    throw new ApiError(message, code, details);
  }

  const result = (data?.data ?? data) as T;
  const resToken = data?.token || (typeof result === 'object' && result !== null ? (result as any).token : null);
  if (resToken && typeof resToken === 'string') {
    setAuthToken(resToken);
    if (typeof result === 'object' && result !== null && !('token' in (result as any))) {
      (result as any).token = resToken;
    }
  }

  return result;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: 'GET', ...options }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...options }),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: 'DELETE', ...options }),
};
