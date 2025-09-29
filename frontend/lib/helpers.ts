export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001/api";

export class ApiError extends Error { // extends built-in Error
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include", // CRUCIAL for httpOnly cookie auth
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Handle empty response body (e.g. 204 No Content)
  const text = await res.text();
  const json = text ? JSON.parse(text) : {}; // try to parse JSON if any

  if (!res.ok) {
    const message = (json && (json.message || json.error)) || `HTTP ${res.status}`;
    throw new ApiError(message, res.status);
  }

  // returning the whole envelope, not just json.data
  return json as T;
}
