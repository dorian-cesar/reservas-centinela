"use client"

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Mock users database
const MOCK_USERS = [
  { id: "1", email: "admin@centinela.cl", password: "admin123", name: "Administrador", role: "admin" as const },
  { id: "2", email: "usuario@centinela.cl", password: "user123", name: "Juan Pérez", role: "user" as const },
]

export function login(email: string, password: string): User | null {
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password)
  if (user) {
    const authUser = { id: user.id, email: user.email, name: user.name, role: user.role }
    localStorage.setItem("auth_user", JSON.stringify(authUser))
    return authUser
  }
  return null
}

export function register(email: string, password: string, name: string): User {
  const newUser = {
    id: Date.now().toString(),
    email,
    name,
    role: "user" as const,
  }
  // In a real app, this would save to database
  localStorage.setItem("auth_user", JSON.stringify(newUser))
  return newUser
}

export function logout() {
  localStorage.removeItem("auth_user")
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("auth_user")
  return userStr ? JSON.parse(userStr) : null
}
