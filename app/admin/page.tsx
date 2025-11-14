"use client";

import { AuthGuard } from "@/components/auth-guard";
import { useState, useEffect } from "react";
import { logout } from "@/lib/auth";
import { type ApiBusService, type Reservation } from "@/lib/booking-types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Bus, Users, Calendar, LogOut, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ⬇️ TU COMPONENTE ORIGINAL SIN CAMBIOS ⬇️
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div
      className={`p-4 md:p-6 rounded-xl border border-slate-800 bg-slate-900/40 shadow-lg shadow-${color}-900/10 flex items-center gap-4`}
    >
      <div className={`p-3 rounded-xl bg-${color}-900/30`}>{icon}</div>

      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
// ⬆️ TU COMPONENTE ORIGINAL ⬆️

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminContent />
    </AuthGuard>
  );
}

function AdminContent() {
  const router = useRouter();

  const [services, setServices] = useState<ApiBusService[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const [stats, setStats] = useState({
    totalServices: 0,
    activeReservations: 0,
    todayServices: 0,
    occupancyRate: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, reservationsRes] = await Promise.all([
        fetch("/api/services"),
        fetch("/api/reservations"),
      ]);

      const servicesData: ApiBusService[] = await servicesRes.json();
      const reservationsData: Reservation[] = await reservationsRes.json();

      setServices(servicesData);
      setReservations(reservationsData);

      const today = new Date().toISOString().split("T")[0];

      const todayServices = servicesData.filter(
        (s) => s.date.split("T")[0] === today
      );

      const activeReservations = reservationsData.filter((r) => {
        const ex = new Date(r.expiresAt);
        return r.status === "active" && ex > new Date();
      });

      const totalSeats = servicesData.reduce(
        (acc, s) => acc + s.seats.length,
        0
      );

      const occupiedSeats = servicesData.reduce(
        (acc, s) => acc + s.seats.filter((seat) => seat.reserved).length,
        0
      );

      const occupancyRate =
        totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0;

      setStats({
        totalServices: servicesData.length,
        activeReservations: activeReservations.length,
        todayServices: todayServices.length,
        occupancyRate,
      });
    } catch (error) {
      console.error("Admin loadData error:", error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getServiceReservations = (serviceId: string) =>
    reservations.filter(
      (r) => r.serviceId === serviceId && r.status === "active"
    );

  const getOccupancyPercentage = (service: ApiBusService) => {
    const total = service.seats.length;
    const occupied = service.seats.filter((s) => s.reserved).length;
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-CL", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-blue-600 to-blue-800 p-2 md:p-3 rounded-xl shadow-lg shadow-blue-900/50">
              <Bus className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold text-white">
                Panel de Administración
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Minera Centinela
              </p>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <StatCard
            label="Total Servicios"
            value={stats.totalServices}
            icon={<Calendar className="w-8 h-8 text-blue-400" />}
            color="blue"
          />

          <StatCard
            label="Reservas Activas"
            value={stats.activeReservations}
            icon={<Users className="w-8 h-8 text-orange-400" />}
            color="orange"
          />

          <StatCard
            label="Servicios Hoy"
            value={stats.todayServices}
            icon={<Bus className="w-8 h-8 text-green-400" />}
            color="green"
          />

          <StatCard
            label="Ocupación"
            value={`${stats.occupancyRate}%`}
            icon={<BarChart3 className="w-8 h-8 text-purple-400" />}
            color="purple"
          />
        </div>

        {/* Services table */}
        <Card className="bg-slate-900/50 border-slate-800 p-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            Servicios Programados
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {[
                    "Fecha",
                    "Origen",
                    "Destino",
                    "Horario",
                    "Reservas",
                    "Ocupación",
                    "Estado",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left py-3 px-4 text-sm font-semibold text-slate-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {services.slice(0, 20).map((service) => {
                  const serviceReservations = getServiceReservations(
                    service._id
                  );

                  const occupancy = getOccupancyPercentage(service);
                  const totalSeats = service.seats.length;

                  return (
                    <tr
                      key={service._id}
                      className="border-b border-slate-800/50 hover:bg-slate-800/30"
                    >
                      <td className="py-4 px-4 text-slate-300 whitespace-nowrap">
                        {formatDate(service.date)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {service.origin}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {service.destination}
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {service.template.time}
                      </td>
                      <td className="py-4 px-4 text-white font-semibold">
                        {serviceReservations.length}/{totalSeats}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                occupancy === 100
                                  ? "bg-red-500"
                                  : occupancy > 50
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-400">
                            {occupancy}%
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {occupancy === 100 ? (
                          <Badge color="red">Completo</Badge>
                        ) : occupancy > 0 ? (
                          <Badge color="green">Con reservas</Badge>
                        ) : (
                          <Badge color="slate">Disponible</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
