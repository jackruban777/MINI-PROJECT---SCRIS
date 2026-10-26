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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `/api/v1${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Include HTTP-only cookies
  });

  const contentType = response.headers.get('content-type');
  let data: any;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else if (contentType && (contentType.includes('application/pdf') || contentType.includes('text/csv'))) {
    // Return blob for file downloads
    return (await response.blob()) as unknown as T;
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.message || `Request failed with status ${response.status}`;
    const code = data?.error?.code || 'UNKNOWN_ERROR';
    const details = data?.error?.details;
    throw new ApiError(message, code, details);
  }

  return (data?.data ?? data) as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: 'GET', ...options }),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : undefined, ...options }),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : undefined, ...options }),
  delete: <T>(endpoint: string, options?: RequestInit) => request<T>(endpoint, { method: 'DELETE', ...options }),
};
