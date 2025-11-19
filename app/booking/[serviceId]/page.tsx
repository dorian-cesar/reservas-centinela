"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { BusSeatLayout } from "@/components/bus-seat-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Swal from "sweetalert2";
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

export const AppSwal = Swal.mixin({
  customClass: {
    popup: "swal2-popup",
    confirmButton: "app-confirm-btn",
    cancelButton: "app-cancel-btn",
  },
  buttonsStyling: false,
});

function BookingContent() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.serviceId as string;

  const { selectedService, getServiceById, setSelectedService } =
    useServicesStore();

  const [service, setService] = useState<ApiBusService | null>(
    selectedService || null
  );
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [userReservedSeats, setUserReservedSeats] = useState<string[]>([]);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const user = getCurrentUser();
  const userId = user?._id;

  // ---------------------------
  // OBTENER SERVICIO DESDE STORE
  // ---------------------------
  useEffect(() => {
    let srv: ApiBusService | undefined;

    if (selectedService?._id === serviceId) {
      srv = selectedService;
    } else {
      srv = getServiceById(serviceId);
    }

    if (!srv) {
      router.push("/dashboard");
      return;
    }

    setService(srv);
    setSelectedService(srv);

    console.log("Servicio seleccionado:", srv);

    if (userId) {
      const foundSeats = srv.seats
        .filter((s) => s.reservedBy === userId)
        .map((s) => s.seatNumber);

      setUserReservedSeats(foundSeats);
    }
  }, [
    serviceId,
    selectedService,
    userId,
    getServiceById,
    setSelectedService,
    router,
  ]);

  // Construye layout
  const buildFinalLayout = () => {
    if (!service) return [];

    const piso1 = service.busLayout.floor1.seatMap;

    const reservedNumbers = service.seats
      .filter((s) => s.reserved)
      .map((s) => s.seatNumber);

    return piso1.map((row) =>
      row.map((seatValue) => {
        if (!seatValue) return ""; // pasillo
        if (seatValue === "WC") return "WC"; // baño
        return seatValue; // el número real del asiento
      })
    );
  };

  const finalLayout = buildFinalLayout();

  // Reservar asiento
  const handleSeatSelect = async (seatNumber: string) => {
    if (!userId || !service || isLoading) return;

    if (userReservedSeats.length >= 1) {
      AppSwal.fire({
        icon: "info",
        title: "Reserva existente",
        text: "Solo puedes reservar un asiento por servicio.",
        confirmButtonColor: "#f97316",
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/services/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, serviceId: service._id, seatNumber }),
      });

      const data = await res.json();

      if (!res.ok) {
        AppSwal.fire({
          icon: "error",
          title: "Error",
          text: data.error || "No se pudo reservar el asiento",
          confirmButtonColor: "#dc2626",
        });
        return;
      }

      setSelectedSeat(seatNumber);
      setUserReservedSeats((prev) => [...prev, seatNumber]);

      setReservationId(data.data.reservation._id);
      localStorage.setItem("reservationId", data.data.reservation._id);
    } catch (error: any) {
      console.error(error);
      AppSwal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo reservar el asiento",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Confirmar reserva
  const handleConfirmReservation = async () => {
    if (!reservationId) return;
    setIsLoading(true);
    console.log("ReservationId:", reservationId);
    try {
      const res = await fetch("/api/services/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        AppSwal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo confirmar la reserva",
          confirmButtonColor: "#dc2626",
        });
        return;
      }

      setShowConfirmation(true);
    } catch (error: any) {
      console.error(error);
      AppSwal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo confirmar la reserva",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Desreservar asiento
  const handleUnreserve = async (seatNumber: string) => {
    if (!userId || !service || isLoading) return;

    const toChileDate = (dateStr: string) =>
      new Date(
        new Date(dateStr).toLocaleString("en-CL", {
          timeZone: "America/Santiago",
        })
      );

    const nowChile = toChileDate(new Date().toISOString());
    const departureChile = toChileDate(service.date);

    const diffMs = departureChile.getTime() - nowChile.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 48) {
      AppSwal.fire({
        icon: "warning",
        title: "No se puede liberar el asiento",
        text: "No puedes liberar el asiento porque faltan menos de 48 horas para la salida.",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    const seat = service.seats.find((s) => s.seatNumber === seatNumber);

    if (seat?.confirmed) {
      const result = await AppSwal.fire({
        icon: "warning",
        title: "Asiento confirmado",
        text: "Este asiento ya fue confirmado. ¿Seguro que quieres liberarlo?",
        showCancelButton: true,
        confirmButtonText: "Sí, liberar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#dc2626",
      });

      if (!result.isConfirmed) return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/services/unreserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          serviceId: service._id,
          seatNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        AppSwal.fire({
          icon: "info",
          title: "No se puede liberar el asiento",
          text: data.error || "No se pudo desreservar el asiento.",
          confirmButtonColor: "#dc2626",
        });
        return;
      }

      setReservationId(null);
      localStorage.removeItem("reservationId");

      setUserReservedSeats((prev) => prev.filter((s) => s !== seatNumber));

      if (selectedSeat === seatNumber) {
        setSelectedSeat(null);
      }

      setSelectedService((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          seats: prev.seats.map((s) =>
            s.seatNumber === seatNumber
              ? {
                  ...s,
                  reserved: false,
                  confirmed: false,
                  reservedBy: null,
                  reservationId: null,
                }
              : s
          ),
        };
      });

      AppSwal.fire({
        icon: "success",
        title: "Reserva cancelada",
        text: "El asiento ha vuelto a quedar disponible",
        confirmButtonColor: "#22c55e",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Descargar ticket PDF
  const downloadTicketPdf = async () => {
    if (!service || !userId) return;

    const confirmedSeat = service.seats.find(
      (s) => s.confirmed && s.confirmedBy === userId
    );

    if (!confirmedSeat) {
      alert("No tienes ningún asiento confirmado.");
      return;
    }

    const userSeat = service.userConfirmedSeats.find(
      (s) => s.seatNumber === confirmedSeat.seatNumber
    );

    const reservationId = userSeat?.reservationId;

    if (!reservationId) {
      alert("No se encontró el reservationId para este asiento.");
      return;
    }

    setIsDownloading(true);

    try {
      const res = await fetch(
        `/api/services/ticket-pdf?reservationId=${reservationId}`
      );

      if (!res.ok) {
        alert("No se pudo descargar el PDF");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket_centinela_${reservationId}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error descargando el archivo");
    } finally {
      setIsDownloading(false);
    }
  };

  // ---------------------------
  // LOADING SERVICIO
  // ---------------------------
  if (!service) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const raw = date.toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return raw
      .toLowerCase()
      .split(" ")
      .map((word) => {
        if (word === "de") return "de";
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(" ");
  };

  // ---------------------------
  // CONFIRMATION UI
  // ---------------------------
  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900/60 backdrop-blur-xl border border-green-700/50 p-8 md:p-10 max-w-lg w-full text-center rounded-2xl shadow-xl shadow-black/40">
          <div className="mb-2 flex justify-center">
            <div className="bg-green-600 rounded-full p-5 md:p-6 animate-soft-pulse shadow-lg shadow-green-900/70">
              <CheckCircle className="w-14 h-14 md:w-16 md:h-16 text-white" />
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
            ¡Reserva Confirmada!
          </h2>

          <p className="text-base md:text-lg text-slate-300 mb-2">
            Gracias por reservar con nosotros, <b>{user?.name}</b>.
          </p>

          <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 md:p-6 space-y-5 text-left">
            {/* Asiento */}
            <div className="flex items-center gap-3">
              <div className="bg-green-700/30 p-3 rounded-xl border border-green-700/40">
                <MapPin className="text-green-400 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Asiento asignado</p>
                <p className="text-2xl font-bold text-green-400">
                  #{selectedSeat}
                </p>
              </div>
            </div>

            {/* Ruta */}
            <div className="flex items-center gap-3">
              <div className="bg-blue-700/20 p-3 rounded-xl border border-blue-700/40">
                <MapPin className="text-blue-300 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Ruta</p>
                <p className="text-lg font-semibold text-white">
                  {service.origin} → {service.destination}
                </p>
              </div>
            </div>

            {/* Fecha */}
            <div className="flex items-center gap-3">
              <div className="bg-orange-700/20 p-3 rounded-xl border border-orange-600/40">
                <Calendar className="text-orange-300 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Fecha</p>
                <p className="text-base text-slate-200">
                  {formatDate(service.date)}
                </p>
              </div>
            </div>

            {/* Hora */}
            <div className="flex items-center gap-3">
              <div className="bg-purple-700/20 p-3 rounded-xl border border-purple-600/40">
                <Clock className="text-purple-300 w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Hora de salida</p>
                <p className="text-lg text-slate-200">
                  {service?.template?.time} hrs
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={() => router.push("/dashboard")}
            className="mt-2 w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-900/40 cursor-pointer"
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
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700">
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
                className="border-slate-700 text-slate-300 bg-slate-900 hover:bg-slate-800 hover:text-white cursor-pointer"
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
          <div className="order-1">
            <Card className="bg-slate-900/50 border-slate-800 p-6">
              <h2 className="text-xl font-bold text-white">
                Detalles del Servicio
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-700/30 p-3 rounded-xl border border-green-700/40">
                    <MapPin className="text-green-400 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Destino</p>
                    <p className="text-lg text-white">
                      {service.origin} → {service.destination}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-orange-700/20 p-3 rounded-xl border border-orange-600/40">
                    <Calendar className="text-orange-300 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Fecha</p>
                    <p className="text-lg text-white">
                      {formatDate(service.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-purple-700/20 p-3 rounded-xl border border-purple-600/40">
                    <Clock className="text-purple-300 w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Horario</p>
                    <p className="text-lg text-white">
                      {service.template.time} hrs
                    </p>
                  </div>
                </div>
              </div>

              {selectedSeat !== null && (
                <div className="mt-6 p-4 bg-orange-600/20 border-2 border-orange-600/50 rounded-xl">
                  <p className="text-sm text-orange-300 mb-1">
                    Asiento Seleccionado
                  </p>
                  <p className="text-3xl font-bold text-orange-400">
                    #{selectedSeat}
                  </p>
                </div>
              )}
            </Card>

            {selectedSeat !== null && (
              <Button
                onClick={handleConfirmReservation}
                disabled={isLoading}
                className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl cursor-pointer"
              >
                {isLoading ? "Confirmando..." : "Confirmar Reserva"}
              </Button>
            )}

            {service &&
              (() => {
                const confirmedSeat = service.seats.find(
                  (s) => s.confirmed && s.confirmedBy === userId
                );

                if (!confirmedSeat) return null;

                return (
                  <Button
                    onClick={downloadTicketPdf}
                    disabled={isDownloading}
                    className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl cursor-pointer"
                  >
                    {isDownloading
                      ? "Descargando..."
                      : "Descargar Ticket en PDF"}
                  </Button>
                );
              })()}
          </div>

          {/* LAYOUT */}
          <div className="order-2 relative">
            <BusSeatLayout
              layout={finalLayout}
              selectedSeat={selectedSeat}
              userReservedSeats={userReservedSeats}
              onSeatSelect={(seatNumber) => {
                if (isLoading) return;
                if (userReservedSeats.includes(seatNumber)) {
                  handleUnreserve(seatNumber);
                  return;
                }
                handleSeatSelect(seatNumber);
              }}
              seats={service.seats}
            />

            {isLoading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 rounded-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
