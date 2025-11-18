"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        setIsLoading(false);
        return;
      }

      // El server devuelve el usuario (token está en cookie HttpOnly)
      const user = data.user;
      localStorage.setItem("auth_user", JSON.stringify(user));
      console.log(user);
      router.push(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (e) {
      console.error(e);
      setError("Error inesperado, por favor intenta nuevamente");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-8">
            <Image
              src="/img/logo-tandem-2026.png"
              alt="Bus"
              width={160}
              height={40}
              className="object-contain"
            />
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-white">
            Sistema de Reservas
          </h1>
          <p className="text-center text-slate-400 mb-8">Minera Centinela</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="usuario@centinela.cl"
                required
              />
            </div>

            {/* CONTRASEÑA */}
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-slate-300">
                Contraseña
              </Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* BOTÓN LOGIN CON SPINNER */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold py-2 rounded-xl shadow-lg shadow-orange-900/50 transition-all duration-300 flex items-center justify-center gap-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/40 p-3 shadow-sm">
            <p className="font-semibold text-slate-200 text-sm mb-1 tracking-wide">
              Credenciales de prueba:
            </p>

            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-slate-500 w-20">Email:</span>
                <span className="text-slate-300 font-medium">
                  juan@centinela.cl
                </span>
              </p>

              <p className="flex items-center gap-2">
                <span className="text-slate-500 w-20">Password:</span>
                <span className="text-slate-300 font-medium">123456</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
