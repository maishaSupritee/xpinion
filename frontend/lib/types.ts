export type Role = "user" | "admin";

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  created_at?: string;
}

export interface AuthPayload { // the payload returned on login/signup
  user: User;
}

export interface ApiEnvelope<T> { // the standard API response envelope
  status: number;        // HTTP status code
  message: string;
  data: T;
}