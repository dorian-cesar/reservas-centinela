"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { getCurrentUser, type User } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = false }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (requireAdmin && currentUser.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [router, requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}
