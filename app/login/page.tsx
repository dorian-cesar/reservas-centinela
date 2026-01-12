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
  const [rut, setRut] = useState("");
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
        body: JSON.stringify({ rut, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("auth_user", JSON.stringify(data.user));
      router.push("/dashboard");
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
            <div className="space-y-2">
              <Label htmlFor="rut" className="text-slate-300 font-medium">
                RUT
              </Label>

              <Input
                id="rut"
                type="text"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20"
                placeholder="12345678-9"
                required
              />
            </div>

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
                className="absolute right-3 top-8.5 text-slate-400 hover:text-slate-200 transition-colors"
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

          <div className="mt-6 text-slate-400 text-sm border-t border-slate-800 pt-6">
            <h3 className="font-semibold text-slate-300 mb-2 text-center">
              Ejemplo de credenciales:
            </h3>

            <p className="mb-1">
              <span className="font-medium text-slate-300">RUT:</span>
              <br />
              12345678-9
              <br />
              <span className="text-slate-500 text-xs">
                (Ingresar sin puntos, con guión)
              </span>
            </p>

            <p>
              <span className="font-medium text-slate-300">Contraseña:</span>
              <br />
              Primeros 6 dígitos del RUT
              <br />
              <span className="italic text-slate-500">
                Ej: RUT 12345678-9 →{" "}
                <span className="text-slate-300 font-semibold">123456</span>
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
