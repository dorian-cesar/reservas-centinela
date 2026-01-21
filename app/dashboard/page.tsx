"use client";

import React from "react";
import { AuthGuard } from "@/components/auth-guard";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "@/lib/auth";
import { type ApiBusService, type Reservation } from "@/lib/booking-types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Bus, Clock, Calendar, LogOut, User, RotateCw } from "lucide-react";
import Image from "next/image";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";
import { es } from "date-fns/locale/es";
import { fetchCities, type CitiesMap } from "@/lib/cities";
import Swal from "sweetalert2";
import Link from "next/link";

import { useServicesStore } from "@/lib/services-store";

registerLocale("es", es);

// Componente CustomInput para evitar el teclado en móviles
const CustomDateInput = React.forwardRef<
  HTMLDivElement,
  { value?: string; onClick?: () => void; placeholder?: string }
>(({ value, onClick, placeholder }, ref) => (
  <div
    ref={ref}
    onClick={onClick}
    className="w-full bg-slate-800 text-white rounded-md px-3 py-2 text-sm border border-slate-700 cursor-pointer"
  >
    {value || placeholder}
  </div>
));
CustomDateInput.displayName = "CustomDateInput";

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

export const AppSwal = Swal.mixin({
  customClass: {
    popup: "swal2-popup",
    confirmButton: "app-confirm-btn",
    cancelButton: "app-cancel-btn",
  },
  buttonsStyling: false,
});

function DashboardContent() {
  const [services, setServices] = useState<ApiBusService[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [citiesMap, setCitiesMap] = useState<CitiesMap>({});
  const [destinations, setDestinations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const user = getCurrentUser();

  const { setServices: setGlobalServices } = useServicesStore();
  const { setSelectedService } = useServicesStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const loadCities = async () => {
      const data = await fetchCities();
      if (data) setCitiesMap(data);
    };
    loadCities();
  }, []);

  const loadMyConfirmedServices = async () => {
    if (!user?._id) {
      console.error("No hay usuario autenticado");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`/api/services/my-confirmed?userId=${user._id}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data?.message === "Token inválido") {
        AppSwal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.",
          confirmButtonColor: "#e11d48",
        });

        setTimeout(() => {
          router.push("/login");
        }, 2000);

        return;
      }

      if (!res.ok) {
        console.error(data.error || "Error cargando reservas");
        setServices([]);
        setGlobalServices([]);
        return;
      }

      const list = Array.isArray(data) ? data : [];
      setServices(list);
      setGlobalServices(list);
    } catch (err) {
      console.error(err);
      setServices([]);
      setGlobalServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectService = (service: ApiBusService) => {
    setSelectedService(service);
    router.push(`/booking/${service._id}`);
  };

  const loadServices = async () => {
    if (!selectedOrigin || !selectedDestination || !selectedDate) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        origin: selectedOrigin,
        destination: selectedDestination,
        date: selectedDate,
      });

      const res = await fetch(`/api/services/search?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (data?.message === "Token inválido") {
        AppSwal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.",
          confirmButtonColor: "#e11d48",
        });

        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      if (data?.error === "No autorizado") {
        AppSwal.fire({
          icon: "warning",
          title: "Sesión expirada",
          text: "Tu sesión ha caducado. Por favor, inicia sesión nuevamente.",
          confirmButtonColor: "#e11d48",
        });

        setTimeout(() => router.push("/login"), 2000);
        return;
      }

      if (!res.ok) {
        console.error(data.error || "Error cargando servicios");
        setServices([]);
        setGlobalServices([]);
        return;
      }

      const list = Array.isArray(data) ? data : [];
      setServices(list);
      setGlobalServices(list);
    } catch (err) {
      console.error(err);
      setServices([]);
      setGlobalServices([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedOrigin || !citiesMap[selectedOrigin]) {
      setDestinations([]);
      return;
    }
    setDestinations(citiesMap[selectedOrigin]);
  }, [selectedOrigin, citiesMap]);

  const hasReservationForService = (service: ApiBusService) =>
    service.seats?.some(
      (s) => s.reservedBy === user?._id && s.confirmed === true,
    );

  const formatDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const date = new Date(y, m - 1, d);

    const raw = date.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return raw
      .toLowerCase()
      .split(" ")
      .map((word) =>
        word === "de" ? "de" : word.charAt(0).toUpperCase() + word.slice(1),
      )
      .join(" ");
  };

  const formatName = (name: string) =>
    name
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const todayChile = new Date(
    new Intl.DateTimeFormat("en-CL", {
      timeZone: "America/Santiago",
    }).format(new Date()),
  );

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* HEADER */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700 sticky top-0 z-40 py-2 md:py-3">
        <div className="container mx-auto px-3 md:px-4 flex flex-col sm:flex-row items-center justify-between md:gap-3">
          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
            <Image
              src="/img/logo-tandem-2026.png"
              alt="Logo Tandem"
              width={100}
              height={25}
              className="object-contain w-24 md:w-32 lg:w-40"
            />
            <div className="flex-1 sm:flex-none">
              <h1 className="text-xs md:text-sm lg:text-base xl:text-lg font-bold text-white leading-tight">
                Sistema de Reservas
              </h1>
              <p className="text-[10px] md:text-xs text-slate-400 leading-tight">
                Minera Centinela
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1 md:gap-2 text-slate-300">
              <User className="w-3 h-3 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm font-medium truncate max-w-20 md:max-w-30 lg:max-w-none">
                {user?.name ? formatName(user.name) : ""}
              </span>
            </div>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent cursor-pointer h-7 md:h-8 px-2 md:px-3 text-xs"
            >
              <LogOut className="w-3 h-3 md:mr-1" />
              <span className="hidden md:inline">Salir</span>
              <span className="md:hidden">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6">
          <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 lg:py-8 space-y-4 md:space-y-6">
            {/* FILTROS */}
            <div className="bg-slate-900/40 border border-slate-800 p-3 md:p-4 rounded-xl flex flex-col md:flex-col xl:flex-row xl:items-end justify-between gap-3 md:gap-4">
              <div className="flex flex-col xl:flex-row xl:items-end gap-3 md:gap-4 flex-1 flex-wrap">
                {/* ORIGEN */}
                <div className="flex flex-col w-full xl:flex-1 min-w-37.5 xl:max-w-75">
                  <label className="text-slate-400 text-xs mb-1">
                    Ciudad de origen
                  </label>
                  <Select
                    value={selectedOrigin}
                    onValueChange={setSelectedOrigin}
                  >
                    <SelectTrigger className="w-full bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:text-white h-9 md:h-10">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-slate-800 border-slate-700 text-white w-full"
                      position="popper"
                    >
                      {Object.keys(citiesMap).map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* DESTINO */}
                <div className="flex flex-col w-full xl:flex-1 min-w-37.5 xl:max-w-75">
                  <label className="text-slate-400 text-xs mb-1">
                    Ciudad destino
                  </label>
                  <Select
                    value={selectedDestination}
                    onValueChange={setSelectedDestination}
                    disabled={!selectedOrigin || destinations.length === 0}
                  >
                    <SelectTrigger
                      className="w-full bg-slate-800 text-white border-slate-700 hover:bg-slate-700 hover:text-white h-9 md:h-10
                    disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-slate-800 border-slate-700 text-white w-full"
                      position="popper"
                    >
                      {destinations.map((dest) => (
                        <SelectItem key={dest} value={dest}>
                          {dest}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* FECHA */}
                <div className="flex flex-col w-full xl:flex-1 min-w-37.5 xl:max-w-75">
                  <label className="text-slate-400 text-xs mb-1">
                    Fecha de salida
                  </label>
                  <DatePicker
                    selected={
                      selectedDate
                        ? (() => {
                            const [y, m, d] = selectedDate
                              .split("-")
                              .map(Number);
                            return new Date(y, m - 1, d);
                          })()
                        : null
                    }
                    onChange={(date) =>
                      setSelectedDate(
                        date
                          ? new Intl.DateTimeFormat("en-CA", {
                              timeZone: "America/Santiago",
                            })
                              .format(date)
                              .replaceAll("/", "-")
                          : "",
                      )
                    }
                    locale="es"
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Seleccionar fecha"
                    minDate={todayChile}
                    customInput={
                      <CustomDateInput placeholder="Seleccionar fecha" />
                    }
                    popperClassName="!z-[100] react-datepicker-above-header"
                    popperPlacement="top-start"
                  />
                </div>

                <Button
                  onClick={loadServices}
                  disabled={
                    isLoading ||
                    !selectedOrigin ||
                    !selectedDestination ||
                    !selectedDate
                  }
                  className={`bg-slate-700 text-white font-medium text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-md transition-all flex items-center gap-1 md:gap-2 cursor-pointer w-full xl:w-auto h-9 md:h-10 ${
                    isLoading
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:bg-slate-800"
                  }`}
                >
                  <RotateCw
                    className={`w-3 h-3 md:w-4 md:h-4 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  {isLoading ? "Buscando..." : "Buscar"}
                </Button>
              </div>

              <Button
                onClick={loadMyConfirmedServices}
                disabled={isLoading}
                className={`bg-green-800 text-white font-medium text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg shadow-md transition-all flex items-center gap-1 md:gap-2 cursor-pointer w-full xl:w-auto h-9 md:h-10 mt-2 xl:mt-0 ${
                  isLoading
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-green-900"
                }`}
              >
                <RotateCw
                  className={`w-3 h-3 md:w-4 md:h-4 ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
                Mis asientos reservados
              </Button>
            </div>

            {/* INSTRUCCIÓN DE CANCELACIÓN */}
            <div>
              <p className="text-slate-300 text-xs text-center">
                Para cancelar tu pasaje, haz click en{" "}
                <span className="font-semibold">"Mis asientos reservados"</span>
                , selecciona tu viaje y haz click en tu asiento seleccionado.
              </p>
            </div>

            {/* SERVICIOS */}
            <div>
              <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-3 md:mb-4">
                Servicios Disponibles
              </h2>
              <div className="flex flex-col gap-2 md:gap-3">
                {services.length === 0 && !isLoading && (
                  <p className="text-slate-400 text-xs md:text-sm">
                    No hay servicios disponibles
                  </p>
                )}

                {services.map((service) => {
                  const reserved = hasReservationForService(service);

                  return (
                    <Card
                      key={service._id}
                      className="bg-slate-900/60 border-blue-700/50 p-2 md:p-3 hover:border-blue-700 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4 w-full"
                    >
                      <img
                        src="/favicon.ico"
                        alt="Logo Tandem"
                        className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 object-contain"
                      />

                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                          {/* TITULO + DETALLES */}
                          <div className="text-left">
                            <h3 className="text-sm md:text-base font-bold text-white">
                              {`#${service.serviceNumber} ${service.origin} → ${service.destination}`}
                            </h3>

                            <div className="mt-1 md:mt-2 text-xs text-slate-300 space-y-0.5 md:space-y-1">
                              <div className="flex items-center gap-1 md:gap-2">
                                <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-500" />
                                <span>{formatDate(service.date)}</span>
                              </div>

                              <div className="flex items-center gap-1 md:gap-2">
                                <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-slate-500" />
                                <span>{service.template.time} hrs</span>
                              </div>
                            </div>
                          </div>

                          {/* BADGE */}
                          {reserved && (
                            <div className="mt-1 md:mt-2 inline-flex px-2 py-0.5 md:px-3 md:py-1 bg-green-600/20 border border-green-600 text-green-400 rounded-full text-xs font-medium items-center gap-0.5 md:gap-1 w-fit lg:mt-0">
                              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full"></span>
                              <span className="text-xs">
                                Tienes un asiento reservado
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleSelectService(service)}
                        className="bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold text-xs w-full sm:w-auto cursor-pointer h-8 md:h-9 mt-2 sm:mt-0"
                      >
                        Seleccionar Servicio
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* FOOTER */}
      <footer className="py-4 border-t border-slate-800 text-center">
        <Link
          href="/politica-de-privacidad"
          className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Política de Privacidad
        </Link>
      </footer>
    </div>
  );
}
