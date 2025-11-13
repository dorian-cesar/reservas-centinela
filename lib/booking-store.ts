"use client"

export interface BusService {
  id: string
  route: "antofagasta" | "calama"
  direction: "ida" | "vuelta"
  departureTime: string
  arrivalTime: string
  date: string
  busType: string
  layout: number[][] // 0 = available, 1 = reserved, 2 = occupied
}

export interface Reservation {
  id: string
  userId: string
  serviceId: string
  seatNumber: number
  reservedAt: string
  expiresAt: string
  status: "active" | "expired" | "confirmed"
}

export interface BusLayout {
  id: string
  name: string
  rows: number
  seatsPerRow: number
  layout: number[][] // Matrix representing seat positions
}

const BUS_LAYOUTS: BusLayout[] = [
  {
    id: "standard-40",
    name: "Bus Estándar 40 asientos",
    rows: 10,
    seatsPerRow: 4,
    layout: Array(10)
      .fill(0)
      .map(() => [1, 1, 0, 1, 1]), // 1 = seat, 0 = aisle
  },
  {
    id: "ejecutivo-32",
    name: "Bus Ejecutivo 32 asientos",
    rows: 8,
    seatsPerRow: 4,
    layout: Array(8)
      .fill(0)
      .map(() => [1, 1, 0, 1, 1]),
  },
]

// Initialize mock services
function initializeMockServices(): BusService[] {
  const services: BusService[] = []
  const today = new Date()

  // Generate services for next 14 days
  for (let i = 0; i < 14; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]

    // Antofagasta - Ida
    services.push({
      id: `ant-ida-${dateStr}`,
      route: "antofagasta",
      direction: "ida",
      departureTime: "07:00",
      arrivalTime: "10:30",
      date: dateStr,
      busType: "standard-40",
      layout: Array(10)
        .fill(0)
        .map(() => [0, 0, 0, 0, 0]),
    })

    // Antofagasta - Vuelta
    services.push({
      id: `ant-vuelta-${dateStr}`,
      route: "antofagasta",
      direction: "vuelta",
      departureTime: "18:00",
      arrivalTime: "21:30",
      date: dateStr,
      busType: "standard-40",
      layout: Array(10)
        .fill(0)
        .map(() => [0, 0, 0, 0, 0]),
    })

    // Calama - Ida
    services.push({
      id: `cal-ida-${dateStr}`,
      route: "calama",
      direction: "ida",
      departureTime: "08:00",
      arrivalTime: "10:00",
      date: dateStr,
      busType: "ejecutivo-32",
      layout: Array(8)
        .fill(0)
        .map(() => [0, 0, 0, 0, 0]),
    })

    // Calama - Vuelta
    services.push({
      id: `cal-vuelta-${dateStr}`,
      route: "calama",
      direction: "vuelta",
      departureTime: "17:00",
      arrivalTime: "19:00",
      date: dateStr,
      busType: "ejecutivo-32",
      layout: Array(8)
        .fill(0)
        .map(() => [0, 0, 0, 0, 0]),
    })
  }

  return services
}

export function getServices(): BusService[] {
  const stored = localStorage.getItem("bus_services")
  if (!stored) {
    const services = initializeMockServices()
    localStorage.setItem("bus_services", JSON.stringify(services))
    return services
  }
  return JSON.parse(stored)
}

export function getReservations(): Reservation[] {
  const stored = localStorage.getItem("reservations")
  return stored ? JSON.parse(stored) : []
}

export function createReservation(userId: string, serviceId: string, seatNumber: number): Reservation {
  const reservations = getReservations()
  const now = new Date()
  const expires = new Date(now.getTime() + 48 * 60 * 60 * 1000) // 48 hours

  const reservation: Reservation = {
    id: `${userId}-${serviceId}-${seatNumber}`,
    userId,
    serviceId,
    seatNumber,
    reservedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    status: "active",
  }

  reservations.push(reservation)
  localStorage.setItem("reservations", JSON.stringify(reservations))

  // Update service layout
  const services = getServices()
  const service = services.find((s) => s.id === serviceId)
  if (service) {
    const row = Math.floor(seatNumber / 4)
    const col = (seatNumber % 4) + (seatNumber % 4 >= 2 ? 1 : 0) // Account for aisle
    service.layout[row][col] = 1
    localStorage.setItem("bus_services", JSON.stringify(services))
  }

  return reservation
}

export function getUserReservations(userId: string): Reservation[] {
  const reservations = getReservations()
  const now = new Date()

  return reservations.filter((r) => {
    if (r.userId !== userId) return false
    if (r.status === "expired") return false

    // Check if expired
    if (new Date(r.expiresAt) < now) {
      r.status = "expired"
      return false
    }

    return true
  })
}

export function cancelReservation(reservationId: string) {
  const reservations = getReservations()
  const index = reservations.findIndex((r) => r.id === reservationId)

  if (index !== -1) {
    const reservation = reservations[index]
    reservations.splice(index, 1)
    localStorage.setItem("reservations", JSON.stringify(reservations))

    // Update service layout
    const services = getServices()
    const service = services.find((s) => s.id === reservation.serviceId)
    if (service) {
      const row = Math.floor(reservation.seatNumber / 4)
      const col = (reservation.seatNumber % 4) + (reservation.seatNumber % 4 >= 2 ? 1 : 0)
      service.layout[row][col] = 0
      localStorage.setItem("bus_services", JSON.stringify(services))
    }
  }
}

export function getBusLayouts(): BusLayout[] {
  return BUS_LAYOUTS
}
