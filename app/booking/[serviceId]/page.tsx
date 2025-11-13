"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getServices,
  createReservation,
  getUserReservations,
  type BusService,
} from "@/lib/booking-store";
import { BusSeatLayout } from "@/components/bus-seat-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function BookingPage() {
  return (
    <AuthGuard>
      <BookingContent />
    </AuthGuard>
  );
}

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const [userId] = useState(() => getCurrentUser()?.id);

  const [service, setService] = useState<BusService | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [userReservedSeat, setUserReservedSeat] = useState<number | undefined>(
    undefined
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("Loading service and checking reservations", {
      serviceId,
      userId,
    });

    const services = getServices();
    const foundService = services.find((s) => s.id === serviceId);

    if (!foundService) {
      console.log("Service not found, redirecting to dashboard");
      router.push("/dashboard");
      return;
    }

    setService(foundService);

    if (userId) {
      const userReservations = getUserReservations(userId);
      const existingReservation = userReservations.find(
        (r) => r.serviceId === serviceId
      );
      if (existingReservation) {
        console.log("User already has reservation:", existingReservation);
        setUserReservedSeat(existingReservation.seatNumber);
      }
    }
  }, [serviceId, userId, router]);

  const handleConfirmReservation = () => {
    console.log("Confirm reservation clicked", {
      selectedSeat,
      userId,
      service: service?.id,
    });

    if (!selectedSeat && selectedSeat !== 0) {
      console.log("No seat selected");
      return;
    }

    if (!userId) {
      console.log("No user found");
      return;
    }

    if (!service) {
      console.log("No service found");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Creating reservation...");
      createReservation(userId, service.id, selectedSeat);
      console.log("Reservation created successfully");
      setShowConfirmation(true);

      // setTimeout(() => {
      //   console.log("Redirecting to dashboard");
      //   router.push("/dashboard");
      // }, 2000);
    } catch (error) {
      console.error("Error creating reservation:", error);
      setIsLoading(false);
    }
  };

  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getRouteDisplay = (route: string) => {
    return route === "antofagasta" ? "Antofagasta" : "Calama";
  };

  const getDirectionDisplay = (direction: string) => {
    return direction === "ida" ? "Ida" : "Vuelta";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (showConfirmation && service) {
    const user = getCurrentUser();
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/50 border-green-700/50 p-8 md:p-10 max-w-lg text-center">
          {/* Ícono de éxito */}
          <div className="mb-6 flex justify-center">
            <div className="bg-green-600 rounded-full p-4 md:p-6 animate-soft-pulse shadow-lg shadow-green-900/50">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>

          {/* Título */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            ¡Reserva Confirmada!
          </h2>
          <p className="text-sm md:text-base text-slate-300 mb-2">
            Tu asiento ha sido reservado exitosamente.
          </p>

          {/* Nombre del usuario */}
          <p className="text-base md:text-lg font-semibold text-slate-300 mb-2">
            {user?.name || ""}
          </p>

          {/* Datos del servicio */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6 text-left space-y-3">
            <div>
              <p className="text-xs md:text-sm text-slate-400">Asiento</p>
              <p className="text-xl md:text-2xl font-bold text-green-400">
                #{selectedSeat !== null ? selectedSeat + 1 : ""}
              </p>
            </div>

            <div>
              <p className="text-xs md:text-sm text-slate-400">Ruta</p>
              <p className="text-base md:text-lg font-semibold text-white">
                {getRouteDisplay(service.route)} -{" "}
                {getDirectionDisplay(service.direction)}
              </p>
            </div>

            <div>
              <p className="text-xs md:text-sm text-slate-400">Fecha</p>
              <p className="text-sm md:text-base font-medium text-slate-200 capitalize">
                {formatDate(service.date)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-slate-400">
                  Hora de salida
                </p>
                <p className="text-base md:text-lg font-semibold text-orange-400">
                  {service.departureTime}
                </p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-400">
                  Hora de llegada
                </p>
                <p className="text-base md:text-lg font-semibold text-blue-400">
                  {service.arrivalTime}
                </p>
              </div>
            </div>
          </div>

          {/* Botón para volver */}
          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-8 w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition-all duration-300"
          >
            Volver al listado de viajes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/img/logo-tandem-2026.png"
                alt="Bus"
                width={160}
                height={40}
                className="object-contain"
              />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">
                  Selecciona tu Asiento
                </h1>
                <p className="text-xs md:text-sm text-slate-400">
                  Elige el asiento de tu preferencia
                </p>
              </div>
            </div>

            <Link href="/dashboard" className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          {/* Service Info */}
          <div className="order-2 lg:order-1">
            <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                Detalles del Servicio
              </h2>

              <div className="space-y-3 md:space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/20 p-2 md:p-3 rounded-lg">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-slate-400">Destino</p>
                    <p className="text-base md:text-lg font-bold text-white truncate">
                      {getRouteDisplay(service.route)} -{" "}
                      {getDirectionDisplay(service.direction)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-orange-600/20 p-2 md:p-3 rounded-lg">
                    <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-slate-400">Fecha</p>
                    <p className="text-sm md:text-lg font-semibold text-white capitalize line-clamp-2">
                      {formatDate(service.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-green-600/20 p-2 md:p-3 rounded-lg">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-slate-400">Horario</p>
                    <p className="text-base md:text-lg font-semibold text-white">
                      {service.departureTime} - {service.arrivalTime}
                    </p>
                  </div>
                </div>
              </div>

              {selectedSeat !== null && (
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-orange-600/20 border-2 border-orange-600/50 rounded-xl">
                  <p className="text-xs md:text-sm text-orange-300 mb-1">
                    Asiento Seleccionado
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-orange-400">
                    #{selectedSeat + 1}
                  </p>
                </div>
              )}
            </Card>

            {selectedSeat !== null && (
              <Button
                onClick={handleConfirmReservation}
                disabled={isLoading}
                className="w-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-4 md:py-6 text-base md:text-lg rounded-xl shadow-lg shadow-orange-900/50 transition-all duration-300 cursor-pointer"
              >
                {isLoading ? "Confirmando..." : "Confirmar Reserva"}
              </Button>
            )}

            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-900/20 border border-blue-700/50 rounded-xl">
              <p className="text-xs md:text-sm text-blue-300 font-semibold mb-2">
                Información Importante:
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• La reserva es válida por 48 horas</li>
                <li>• Solo puedes reservar un asiento por servicio</li>
                <li>• El servicio no tiene costo para trabajadores</li>
                <li>• Debes presentarte 15 minutos antes de la salida</li>
              </ul>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <BusSeatLayout
              layout={service.layout}
              onSeatSelect={setSelectedSeat}
              selectedSeat={selectedSeat}
              userReservedSeat={userReservedSeat}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
