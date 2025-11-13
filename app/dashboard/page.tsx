"use client"

import { AuthGuard } from "@/components/auth-guard"
import { useState, useEffect } from "react"
import { getCurrentUser, logout } from "@/lib/auth"
import { getServices, getUserReservations, type BusService, type Reservation } from "@/lib/booking-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Bus, MapPin, Clock, Calendar, LogOut, User, Ticket } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}

function DashboardContent() {
  const [services, setServices] = useState<BusService[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedRoute, setSelectedRoute] = useState<"all" | "antofagasta" | "calama">("all")
  const [selectedDirection, setSelectedDirection] = useState<"all" | "ida" | "vuelta">("all")
  const router = useRouter()
  const user = getCurrentUser()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allServices = getServices()
    const today = new Date()
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000)

    const availableServices = allServices.filter((service) => {
      const serviceDate = new Date(service.date)
      return serviceDate >= today && serviceDate <= twoWeeksFromNow
    })

    setServices(availableServices)

    if (user) {
      const userRes = getUserReservations(user.id)
      setReservations(userRes)
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const filteredServices = services.filter((s) => {
    const routeMatch = selectedRoute === "all" || s.route === selectedRoute
    const directionMatch = selectedDirection === "all" || s.direction === selectedDirection
    return routeMatch && directionMatch
  })

  const getRouteDisplay = (route: string) => {
    return route === "antofagasta" ? "Antofagasta" : "Calama"
  }

  const getDirectionDisplay = (direction: string) => {
    return direction === "ida" ? "Ida" : "Vuelta"
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const hasReservationForService = (serviceId: string) => {
    return reservations.some((r) => r.serviceId === serviceId && r.status === "active")
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
                <h1 className="text-lg md:text-xl font-bold text-white">Sistema de Reservas</h1>
                <p className="text-xs md:text-sm text-slate-400">Minera Centinela</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4 self-end sm:self-auto">
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium">{user?.name}</span>
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {reservations.length > 0 && (
          <div className="mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 md:w-6 md:h-6 text-orange-500" />
              Mis Reservas Activas
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reservations.map((reservation) => {
                const service = services.find((s) => s.id === reservation.serviceId)
                if (!service) return null

                const expiresDate = new Date(reservation.expiresAt)
                const hoursLeft = Math.floor((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60))

                return (
                  <Card
                    key={reservation.id}
                    className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 border-orange-700/50 p-4 md:p-6"
                  >
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="bg-orange-600 text-white px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-semibold">
                        Asiento {reservation.seatNumber + 1}
                      </div>
                      <div className="text-orange-400 text-xs md:text-sm font-medium">{hoursLeft}h restantes</div>
                    </div>

                    <div className="space-y-2 text-slate-300 text-sm md:text-base">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <span className="font-semibold">
                          {getRouteDisplay(service.route)} - {getDirectionDisplay(service.direction)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                        <span className="line-clamp-2">{formatDate(service.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs md:text-sm">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                        <span>
                          {service.departureTime} - {service.arrivalTime}
                        </span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div>
            <h3 className="text-sm md:text-base font-semibold text-slate-400 mb-2">Destino</h3>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <Button
                onClick={() => setSelectedRoute("all")}
                size="sm"
                className={`${
                  selectedRoute === "all"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                } transition-all duration-300 whitespace-nowrap text-xs md:text-sm`}
              >
                Todos los destinos
              </Button>
              <Button
                onClick={() => setSelectedRoute("antofagasta")}
                size="sm"
                className={`${
                  selectedRoute === "antofagasta"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                } transition-all duration-300 whitespace-nowrap text-xs md:text-sm`}
              >
                Antofagasta
              </Button>
              <Button
                onClick={() => setSelectedRoute("calama")}
                size="sm"
                className={`${
                  selectedRoute === "calama"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                } transition-all duration-300 whitespace-nowrap text-xs md:text-sm`}
              >
                Calama
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm md:text-base font-semibold text-slate-400 mb-2">Dirección</h3>
            <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              <Button
                onClick={() => setSelectedDirection("all")}
                size="sm"
                className={`${
                  selectedDirection === "all"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                } transition-all duration-300 whitespace-nowrap text-xs md:text-sm`}
              >
                Todas las direcciones
              </Button>
              <Button
                onClick={() => setSelectedDirection("ida")}
                size="sm"
                className={`${
                  selectedDirection === "ida"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                } transition-all duration-300 whitespace-nowrap text-xs md:text-sm`}
              >
                Ida
              </Button>
              <Button
                onClick={() => setSelectedDirection("vuelta")}
                size="sm"
                className={`${
                  selectedDirection === "vuelta"
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                } transition-all duration-300 whitespace-nowrap text-xs md:text-sm`}
              >
                Vuelta
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Servicios Disponibles</h2>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const hasReservation = hasReservationForService(service.id)
              const serviceDate = new Date(service.date)
              const today = new Date()
              const daysUntilService = Math.floor((serviceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

              const canBook = daysUntilService >= 2 && !hasReservation

              return (
                <Card
                  key={service.id}
                  className="bg-slate-900/50 border-slate-800 p-4 md:p-6 hover:border-blue-700/50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-white mb-1">
                        {getRouteDisplay(service.route)}
                      </h3>
                      <span
                        className={`text-xs md:text-sm font-medium px-2 py-1 rounded ${
                          service.direction === "ida"
                            ? "bg-blue-600/20 text-blue-400"
                            : "bg-orange-600/20 text-orange-400"
                        }`}
                      >
                        {getDirectionDisplay(service.direction)}
                      </span>
                    </div>
                    <Bus className="w-6 h-6 md:w-8 md:h-8 text-blue-500 flex-shrink-0" />
                  </div>

                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm line-clamp-2">{formatDate(service.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                      <span className="text-xs md:text-sm">
                        {service.departureTime} - {service.arrivalTime}
                      </span>
                    </div>
                  </div>

                  {hasReservation ? (
                    <Button
                      disabled
                      size="sm"
                      className="w-full bg-green-600/20 text-green-400 border border-green-600/50 text-xs md:text-sm"
                    >
                      Ya tienes una reserva
                    </Button>
                  ) : !canBook ? (
                    <Button disabled size="sm" className="w-full bg-slate-800 text-slate-500 text-xs md:text-sm">
                      No disponible para reservar
                    </Button>
                  ) : (
                    <Link href={`/booking/${service.id}`}>
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold shadow-lg shadow-orange-900/50 transition-all duration-300 text-xs md:text-sm"
                      >
                        Reservar Asiento
                      </Button>
                    </Link>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
