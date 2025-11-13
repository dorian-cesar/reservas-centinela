"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "@/lib/auth";
import {
  getServices,
  getUserReservations,
  type BusService,
  type Reservation,
} from "@/lib/booking-store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Bus, Clock, Calendar, LogOut, User, RotateCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";
import { es } from "date-fns/locale/es";

registerLocale("es", es);

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const [services, setServices] = useState<BusService[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<
    "all" | "antofagasta" | "calama"
  >("all");
  const [selectedDirection, setSelectedDirection] = useState<
    "all" | "ida" | "vuelta"
  >("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const user = getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allServices = getServices();
    const today = new Date();
    const twoWeeksFromNow = new Date(
      today.getTime() + 14 * 24 * 60 * 60 * 1000
    );

    const availableServices = allServices.filter((service) => {
      const serviceDate = new Date(service.date);
      return serviceDate >= today && serviceDate <= twoWeeksFromNow;
    });

    setServices(availableServices);

    if (user) {
      const userRes = getUserReservations(user.id);
      setReservations(userRes);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const filteredServices = services.filter((s) => {
    const routeMatch = selectedRoute === "all" || s.route === selectedRoute;
    const directionMatch =
      selectedDirection === "all" || s.direction === selectedDirection;
    const dateMatch =
      !selectedDate ||
      new Date(s.date).toDateString() === new Date(selectedDate).toDateString();
    return routeMatch && directionMatch && dateMatch;
  });

  const getRouteDisplay = (route: string) =>
    route === "antofagasta" ? "Antofagasta" : "Calama";

  const getDirectionDisplay = (direction: string) =>
    direction === "ida" ? "Ida" : "Vuelta";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const hasReservationForService = (serviceId: string) =>
    reservations.some(
      (r) => r.serviceId === serviceId && r.status === "active"
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* HEADER */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Image
              src="/img/logo-tandem-2026.png"
              alt="Logo Tandem"
              width={160}
              height={40}
              className="object-contain"
            />
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">
                Sistema de Reservas
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Minera Centinela
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-300">
              <User className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-xs md:text-sm font-medium">
                {user?.name}
              </span>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
              <span className="hidden md:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
        {/* FILTROS DE BÚSQUEDA */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* SELECT DE CIUDAD */}
            <div className="flex flex-col">
              <label className="text-slate-400 text-xs mb-1">Ciudad</label>

              <div className="relative min-w-[230px]">
                <select
                  value={selectedRoute === "all" ? "" : selectedRoute}
                  onChange={(e) =>
                    setSelectedRoute(
                      e.target.value === "" ? "all" : (e.target.value as any)
                    )
                  }
                  className="bg-slate-800 text-white rounded-md px-3 py-2 text-sm border border-slate-700 appearance-none pr-10 w-full focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
                  <option value="">Todas</option>
                  <option value="antofagasta">Antofagasta</option>
                  <option value="calama">Calama</option>
                </select>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* SELECTOR DE FECHA */}
            <div className="flex flex-col">
              <label className="text-slate-400 text-xs mb-1">
                Fecha de salida
              </label>

              <div className="relative min-w-[250px]">
                <DatePicker
                  selected={selectedDate ? new Date(selectedDate) : null}
                  onChange={(date: Date | null) =>
                    setSelectedDate(
                      date ? date.toISOString().split("T")[0] : ""
                    )
                  }
                  locale="es"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Seleccionar fecha"
                  className="bg-slate-800 text-white rounded-md px-3 py-2 text-sm border border-slate-700 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 pr-10 w-full"
                  calendarClassName="!bg-slate-900 border border-slate-800 text-white rounded-lg shadow-xl"
                  dayClassName={() =>
                    "hover:bg-blue-600/30 text-white transition-colors duration-200 rounded-md"
                  }
                />

                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    title="Quitar fecha"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* BOTÓN ACTUALIZAR */}
          <Button
            // onClick={async () => {
            //   setIsLoading(true);
            //   await loadData();
            //   setIsLoading(false);
            // }}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                loadData();
                setIsLoading(false);
              }, 600); // pequeño delay visual
            }}
            disabled={isLoading}
            className={`bg-slate-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2
             ${
               isLoading
                 ? "opacity-60 cursor-not-allowed"
                 : "hover:bg-slate-800"
             }`}
          >
            <RotateCw
              className={`w-4 h-4 ${
                isLoading ? "animate-spin" : ""
              } transition-colors duration-300`}
            />
            <span>{isLoading ? "Actualizando..." : "Actualizar"}</span>
          </Button>
        </div>

        {/* SERVICIOS DISPONIBLES */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Servicios Disponibles
          </h2>
          <div className="flex flex-col gap-3">
            {filteredServices.map((service) => {
              const hasReservation = hasReservationForService(service.id);
              const serviceDate = new Date(service.date);
              const today = new Date();
              const daysUntilService = Math.floor(
                (serviceDate.getTime() - today.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const canBook = daysUntilService >= 2 && !hasReservation;

              return (
                <Card
                  key={service.id}
                  className="bg-slate-900/60 border-slate-800 p-3 hover:border-blue-700/50 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 w-full"
                >
                  {/* Imagen del bus */}
                  <div className="bg-linear-to-br from-blue-900 to-blue-950 p-3 rounded-xl shadow-md shadow-blue-900/50 shrink-0">
                    <Bus className="w-12 h-12 text-white" />
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 text-left">
                    <h3 className="text-base font-bold text-white">
                      {getRouteDisplay(service.route)}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        service.direction === "ida"
                          ? "bg-blue-600/20 text-blue-400"
                          : "bg-orange-600/20 text-orange-400"
                      }`}
                    >
                      {getDirectionDisplay(service.direction)}
                    </span>
                    <div className="mt-2 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formatDate(service.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>
                          {service.departureTime} - {service.arrivalTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón */}
                  {hasReservation ? (
                    <Button
                      disabled
                      size="sm"
                      className="bg-green-600/20 text-green-400 border border-green-600/50 text-xs w-full sm:w-auto"
                    >
                      Ya tienes una reserva
                    </Button>
                  ) : !canBook ? (
                    <Button
                      disabled
                      size="sm"
                      className="bg-slate-800 text-slate-500 text-xs w-full sm:w-auto"
                    >
                      No disponible
                    </Button>
                  ) : (
                    <Link
                      href={`/booking/${service.id}`}
                      className="w-full sm:w-auto"
                    >
                      <Button
                        size="sm"
                        className="bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold text-xs w-full sm:w-auto"
                      >
                        Reservar Asiento
                      </Button>
                    </Link>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
