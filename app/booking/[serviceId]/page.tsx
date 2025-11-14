"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BusSeatLayout } from "@/components/bus-seat-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Calendar, Clock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { useServicesStore } from "@/lib/services-store";
import type { ApiBusService } from "@/lib/booking-types";

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

  const { getServiceById } = useServicesStore();

  const [service, setService] = useState<ApiBusService | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [userReservedSeat, setUserReservedSeat] = useState<
    number | undefined
  >();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = getCurrentUser();
  const userId = user?._id;

  // ---------------------------
  // OBTENER SERVICIO DESDE STORE
  // ---------------------------
  useEffect(() => {
    const srv = getServiceById(serviceId);

    if (!srv) {
      router.push("/dashboard");
      return;
    }

    setService(srv);

    // detectar si el usuario ya tiene asiento reservado
    if (userId) {
      const found = srv.seats.find((s) => s.reservedBy === userId);
      if (found) setUserReservedSeat(Number(found.seatNumber));
    }
  }, [serviceId, userId, getServiceById, router]);

  // ---------------------------
  // MAPEAR LAYOUT REAL DEL BUS
  // ---------------------------

  // Convierte "1"/"0" (string) a 1/0 (number)
  const mapSeatMap = (seatMap: string[][]) =>
    seatMap.map(
      (row) => row.map((s) => (s === "1" ? 1 : 0)) // 1 = asiento, 0 = pasillo
    );

  // Construye layout REAL combinando seatMap + seats reservados
  const buildFinalLayout = () => {
    if (!service) return [];

    const piso1 = mapSeatMap(service.busLayout.floor1.seatMap);

    // Asientos reservados (array de números)
    const reservedNumbers = service.seats
      .filter((s) => s.reserved)
      .map((s) => Number(s.seatNumber));

    // Marca como "1" los reservados reales
    return piso1.map((row, rIdx) =>
      row.map((col, cIdx) => {
        const seatNumber = rIdx * row.length + cIdx;
        return reservedNumbers.includes(seatNumber) ? 1 : col;
      })
    );
  };

  const finalLayout = buildFinalLayout();

  // ---------------------------
  // CONFIRMAR RESERVA (MOCK)
  // ---------------------------
  const handleConfirmReservation = () => {
    if (selectedSeat === null || !userId || !service) return;
    setIsLoading(true);

    setTimeout(() => {
      setShowConfirmation(true);
      setIsLoading(false);
    }, 600);
  };

  // ---------------------------
  // LOADING
  // ---------------------------
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // ---------------------------
  // HELPERS
  // ---------------------------
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

  // ---------------------------
  // CONFIRMATION UI
  // ---------------------------
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/50 border-green-700/50 p-8 md:p-10 max-w-lg text-center">
          <div className="mb-6 flex justify-center">
            <div className="bg-green-600 rounded-full p-4 md:p-6 animate-soft-pulse shadow-lg shadow-green-900/50">
              <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            ¡Reserva Confirmada!
          </h2>

          <p className="text-base md:text-lg font-semibold text-slate-300 mb-2">
            {user?.name}
          </p>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 md:p-6 text-left space-y-3">
            <div>
              <p className="text-xs md:text-sm text-slate-400">Asiento</p>
              <p className="text-xl md:text-2xl font-bold text-green-400">
                #{selectedSeat! + 1}
              </p>
            </div>

            <div>
              <p className="text-xs md:text-sm text-slate-400">Ruta</p>
              <p className="text-base md:text-lg font-semibold text-white">
                {getRouteDisplay(service.origin)} -{" "}
                {getRouteDisplay(service.destination)}
              </p>
            </div>

            <div>
              <p className="text-xs md:text-sm text-slate-400">Fecha</p>
              <p className="text-sm md:text-base text-slate-200 capitalize">
                {formatDate(service.date)}
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-8 w-full bg-blue-800 hover:bg-blue-900 text-white font-semibold py-3 rounded-lg"
          >
            Volver al listado
          </Button>
        </Card>
      </div>
    );
  }

  // ---------------------------
  // PAGE UI
  // ---------------------------
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/img/logo-tandem-2026.png"
                alt="Logo"
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

            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* INFO */}
          <div className="order-2 lg:order-1">
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Detalles del Servicio
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="text-blue-400" />
                  <div>
                    <p className="text-xs text-slate-400">Destino</p>
                    <p className="text-lg text-white">
                      {service.origin} → {service.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="text-orange-400" />
                  <div>
                    <p className="text-xs text-slate-400">Fecha</p>
                    <p className="text-lg text-white">
                      {formatDate(service.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="text-green-400" />
                  <div>
                    <p className="text-xs text-slate-400">Horario</p>
                    <p className="text-lg text-white">{service.time}</p>
                  </div>
                </div>
              </div>

              {selectedSeat !== null && (
                <div className="mt-6 p-4 bg-orange-600/20 border-2 border-orange-600/50 rounded-xl">
                  <p className="text-sm text-orange-300 mb-1">
                    Asiento Seleccionado
                  </p>
                  <p className="text-3xl font-bold text-orange-400">
                    #{selectedSeat + 1}
                  </p>
                </div>
              )}
            </Card>

            {selectedSeat !== null && (
              <Button
                onClick={handleConfirmReservation}
                disabled={isLoading}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl"
              >
                {isLoading ? "Confirmando..." : "Confirmar Reserva"}
              </Button>
            )}
          </div>

          {/* LAYOUT */}
          <div className="order-1 lg:order-2">
            <BusSeatLayout
              layout={finalLayout}
              selectedSeat={selectedSeat}
              userReservedSeat={userReservedSeat}
              onSeatSelect={setSelectedSeat}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
