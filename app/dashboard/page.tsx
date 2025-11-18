"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "@/lib/auth";
import { type ApiBusService, type Reservation } from "@/lib/booking-types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Bus, Clock, Calendar, LogOut, User, RotateCw } from "lucide-react";
import Image from "next/image";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "@/styles/datepicker.css";
import { es } from "date-fns/locale/es";
import { fetchCities, type CitiesMap } from "@/lib/cities";

import { useServicesStore } from "@/lib/services-store";

registerLocale("es", es);

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

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
      (s) => s.reservedBy === user?._id && s.confirmed === true
    );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
        {/* FILTROS */}
        <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-col xl:flex-row xl:items-end justify-between gap-4">
          <div className="flex flex-col xl:flex-row xl:items-end gap-4 flex-1 flex-wrap">
            {/* ORIGEN */}
            <div className="flex flex-col w-full xl:flex-1 min-w-[150px] xl:max-w-[300px]">
              <label className="text-slate-400 text-xs mb-1">
                Ciudad de origen
              </label>
              <select
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                className="bg-slate-800 text-white rounded-md px-3 py-2 text-sm border border-slate-700 appearance-none pr-10 w-full"
              >
                <option value="">Seleccionar</option>

                {Object.keys(citiesMap).map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {/* DESTINO */}
            <div className="flex flex-col w-full xl:flex-1 min-w-[150px] xl:max-w-[300px]">
              <label className="text-slate-400 text-xs mb-1">
                Ciudad destino
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                disabled={!selectedOrigin || destinations.length === 0}
                className="bg-slate-800 text-white rounded-md px-3 py-2 text-sm border border-slate-700 appearance-none pr-10 w-full
             disabled:bg-slate-700 disabled:text-slate-400"
              >
                <option value="">Seleccionar</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>

            {/* FECHA */}
            <div className="flex flex-col w-full xl:flex-1 min-w-[150px] xl:max-w-[300px]">
              <label className="text-slate-400 text-xs mb-1">
                Fecha de salida
              </label>
              <DatePicker
                selected={
                  selectedDate
                    ? (() => {
                        const [y, m, d] = selectedDate.split("-").map(Number);
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
                      : ""
                  )
                }
                locale="es"
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha"
                className="bg-slate-800 text-white rounded-md px-3 py-2 text-sm border border-slate-700 w-full"
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
              className={`bg-slate-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 ${
                isLoading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-slate-800"
              }`}
            >
              <RotateCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {isLoading ? "Buscando..." : "Buscar"}
            </Button>
          </div>

          <Button
            onClick={loadMyConfirmedServices}
            disabled={isLoading}
            className={`bg-green-800 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-md transition-all flex items-center gap-2 ${
              isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-900"
            }`}
          >
            <RotateCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Mis asientos reservados
          </Button>
        </div>

        {/* SERVICIOS */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            Servicios Disponibles
          </h2>
          <div className="flex flex-col gap-3">
            {services.length === 0 && !isLoading && (
              <p className="text-slate-400 text-sm">
                No hay servicios disponibles
              </p>
            )}

            {services.map((service) => {
              const reserved = hasReservationForService(service);

              return (
                <Card
                  key={service._id}
                  className="bg-slate-900/60 border-blue-700/50 p-3 hover:border-blue-700 transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 w-full"
                >
                  <img
                    src="/favicon.ico"
                    alt="Logo Tandem"
                    className="w-12 h-12 object-contain sm:mb-6"
                  />

                  <div className="flex-1 text-left">
                    <h3 className="text-base font-bold text-white">
                      {service.origin} → {service.destination}
                    </h3>

                    <div className="mt-2 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span>{formatDate(service.date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{service.template.time}</span>
                      </div>
                    </div>

                    {/* BADGE SI TIENE RESERVA */}
                    {reserved && (
                      <div className="mt-2 inline-flex px-3 py-1 bg-green-600/20 border border-green-600 text-green-400 rounded-full text-xs font-medium items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        Tienes un asiento reservado
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    onClick={() => handleSelectService(service)}
                    className="bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold text-xs w-full sm:w-auto"
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
  );
}
