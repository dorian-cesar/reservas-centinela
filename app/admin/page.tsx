"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useState, useEffect } from "react"
import { logout } from "@/lib/auth"
import { getServices, getReservations, type BusService, type Reservation } from "@/lib/booking-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bus, Users, Calendar, LogOut, Upload, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  return (
    <AuthGuard requireAdmin>
      <AdminContent />
    </AuthGuard>
  )
}

function AdminContent() {
  const router = useRouter()
  const [services, setServices] = useState<BusService[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState({
    totalServices: 0,
    activeReservations: 0,
    todayServices: 0,
    occupancyRate: 0,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allServices = getServices()
    const allReservations = getReservations()

    setServices(allServices)
    setReservations(allReservations)

    const today = new Date().toISOString().split("T")[0]
    const todayServices = allServices.filter((s) => s.date === today)
    const activeReservations = allReservations.filter((r) => {
      const expiresAt = new Date(r.expiresAt)
      return expiresAt > new Date() && r.status === "active"
    })

    const totalSeats = allServices.reduce((acc, service) => {
      return acc + service.layout.flat().filter((seat) => seat === 1 || seat === 0).length
    }, 0)
    const occupiedSeats = allServices.reduce((acc, service) => {
      return acc + service.layout.flat().filter((seat) => seat === 1).length
    }, 0)
    const occupancyRate = totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0

    setStats({
      totalServices: allServices.length,
      activeReservations: activeReservations.length,
      todayServices: todayServices.length,
      occupancyRate,
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const getRouteDisplay = (route: string) => {
    return route === "antofagasta" ? "Antofagasta" : "Calama"
  }

  const getDirectionDisplay = (direction: string) => {
    return direction === "ida" ? "Ida" : "Vuelta"
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-CL", { weekday: "short", month: "short", day: "numeric" })
  }

  const getServiceReservations = (serviceId: string) => {
    return reservations.filter((r) => r.serviceId === serviceId && r.status === "active")
  }

  const getOccupancyPercentage = (service: BusService) => {
    const totalSeats = service.layout.flat().filter((seat) => seat === 1 || seat === 0).length
    const occupiedSeats = service.layout.flat().filter((seat) => seat === 1).length
    return totalSeats > 0 ? Math.round((occupiedSeats / totalSeats) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-2 md:p-3 rounded-xl shadow-lg shadow-blue-900/50">
                <Bus className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">Panel de Administración</h1>
                <p className="text-xs md:text-sm text-slate-400">Minera Centinela</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 self-end sm:self-auto">
              <Link href="/admin/upload">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white text-xs md:text-sm"
                >
                  <Upload className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden sm:inline">Cargar Servicios</span>
                  <span className="sm:hidden">Cargar</span>
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent text-xs md:text-sm"
              >
                <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700/50 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-blue-300 mb-1">Total Servicios</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.totalServices}</p>
              </div>
              <div className="bg-blue-600/20 p-2 md:p-4 rounded-xl self-end md:self-auto">
                <Calendar className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-700/50 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-orange-300 mb-1">Reservas Activas</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.activeReservations}</p>
              </div>
              <div className="bg-orange-600/20 p-2 md:p-4 rounded-xl self-end md:self-auto">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/50 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-green-300 mb-1">Servicios Hoy</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.todayServices}</p>
              </div>
              <div className="bg-green-600/20 p-2 md:p-4 rounded-xl self-end md:self-auto">
                <Bus className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-700/50 p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <p className="text-xs md:text-sm text-purple-300 mb-1">Ocupación</p>
                <p className="text-2xl md:text-3xl font-bold text-white">{stats.occupancyRate}%</p>
              </div>
              <div className="bg-purple-600/20 p-2 md:p-4 rounded-xl self-end md:self-auto">
                <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Servicios Programados</h2>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-400 whitespace-nowrap">
                      Fecha
                    </th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-400 whitespace-nowrap">
                      Ruta
                    </th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-400 whitespace-nowrap">
                      Dirección
                    </th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-400 whitespace-nowrap">
                      Horario
                    </th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-400 whitespace-nowrap">
                      Reservas
                    </th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-400 whitespace-nowrap">
                      Ocupación
                    </th>
                    <th className="text-left py-2 md:py-3 px-2 md:px-4 text-xs md:text-sm font-semibold text-slate-400 whitespace-nowrap">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.slice(0, 20).map((service) => {
                    const serviceReservations = getServiceReservations(service.id)
                    const occupancy = getOccupancyPercentage(service)
                    const totalSeats = service.layout.flat().filter((seat) => seat === 1 || seat === 0).length

                    return (
                      <tr
                        key={service.id}
                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          <span className="text-xs md:text-sm text-slate-300 font-medium capitalize whitespace-nowrap">
                            {formatDate(service.date)}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          <span className="text-xs md:text-sm text-white font-semibold whitespace-nowrap">
                            {getRouteDisplay(service.route)}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              service.direction === "ida"
                                ? "bg-blue-600/20 text-blue-400"
                                : "bg-orange-600/20 text-orange-400"
                            }`}
                          >
                            {getDirectionDisplay(service.direction)}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          <span className="text-xs md:text-sm text-slate-300 whitespace-nowrap">
                            {service.departureTime}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          <span className="text-xs md:text-sm text-white font-semibold whitespace-nowrap">
                            {serviceReservations.length}/{totalSeats}
                          </span>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  occupancy > 80 ? "bg-red-500" : occupancy > 50 ? "bg-orange-500" : "bg-green-500"
                                }`}
                                style={{ width: `${occupancy}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-400 w-8 md:w-12 whitespace-nowrap">{occupancy}%</span>
                          </div>
                        </td>
                        <td className="py-3 md:py-4 px-2 md:px-4">
                          {occupancy === 100 ? (
                            <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400 whitespace-nowrap">
                              Completo
                            </span>
                          ) : occupancy > 0 ? (
                            <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400 whitespace-nowrap">
                              Con reservas
                            </span>
                          ) : (
                            <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-slate-600/20 text-slate-400 whitespace-nowrap">
                              Disponible
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
