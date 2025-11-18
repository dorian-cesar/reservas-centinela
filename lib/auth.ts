"use client";

export interface User {
  _id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  token: string;
  user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ============================
// LOGIN REAL (usuario + token)
// ============================
export async function login(
  email: string,
  password: string
): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) return null;

    const data: AuthResponse = await res.json();

    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}

// ============================
// LOGOUT
// ============================
export function logout() {
  localStorage.removeItem("auth_user");
  localStorage.removeItem("auth_token");
}

// ============================
// OBTENER USUARIO DESDE LOCAL
// ============================
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("auth_user");
  return userStr ? JSON.parse(userStr) : null;
}

// ============================
// OBTENER TOKEN
// ============================
export function getToken(): string | null {
  return typeof window !== "undefined"
    ? localStorage.getItem("auth_token")
    : null;
}
