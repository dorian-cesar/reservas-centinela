"use client";

// ------------------
// USER TYPE
// ------------------
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

// ------------------
// REAL API SERVICE (TIPADO EXACTO SEGÚN TU API REAL)
// ------------------
export interface ApiSeat {
  seatNumber: string;
  reserved: boolean;
  _id: string;
  reservedBy?: string;
}

export interface ApiBusLayoutFloor {
  seatMap: string[][];
  _id: string;
}

export interface ApiBusLayout {
  _id: string;
  name: string;
  pisos: number;
  capacidad: number;
  tipo_Asiento_piso_1: string;
  tipo_Asiento_piso_2: string;
  floor1: ApiBusLayoutFloor;
  floor2: ApiBusLayoutFloor;
  __v: number;
}

export interface ApiTemplate {
  _id: string;
  origin: string;
  destination: string;
  startDate: string;
  time: string;
  company: string;
  layout: string;
  daysOfWeek: number[];
  __v: number;
}

export interface ApiBusService {
  _id: string;
  template: ApiTemplate;
  date: string;
  origin: string;
  destination: string;
  busLayout: ApiBusLayout;
  seats: ApiSeat[];
  __v: number;
}

// ------------------
// INTERNAL MOCK TYPE (solo para localStorage)
// ------------------
export interface MockBusService {
  id: string;
  route: "antofagasta" | "calama";
  direction: "ida" | "vuelta";
  date: string;
  departureTime: string;
  arrivalTime: string;
  busType: string;
  layout: number[][];
  reserved: boolean;
  reservedBy: string | null;
}

// ------------------
// RESERVATION
// ------------------
export interface Reservation {
  id: string;
  userId: string;
  serviceId: string;
  seatNumber: number;
  reservedAt: string;
  expiresAt: string;
  status: "active" | "expired" | "confirmed";
}

// ------------------
// BUS LAYOUT (solo para mocks y UI)
// ------------------
export interface BusLayout {
  id: string;
  name: string;
  rows: number;
  seatsPerRow: number;
  layout: number[][];
}

// const BUS_LAYOUTS: BusLayout[] = [
//   {
//     id: "standard-40",
//     name: "Bus Estándar 40 asientos",
//     rows: 10,
//     seatsPerRow: 4,
//     layout: Array(10)
//       .fill(0)
//       .map(() => [1, 1, 0, 1, 1]),
//   },
//   {
//     id: "ejecutivo-32",
//     name: "Bus Ejecutivo 32 asientos",
//     rows: 8,
//     seatsPerRow: 4,
//     layout: Array(8)
//       .fill(0)
//       .map(() => [1, 1, 0, 1, 1]),
//   },
// ];

// // ------------------
// // MOCK SERVICES (se mantienen, pero con el tipo MockBusService)
// // ------------------
// function initializeMockServices(): MockBusService[] {
//   const services: MockBusService[] = [];
//   const today = new Date();

//   for (let i = 0; i < 14; i++) {
//     const date = new Date(today);
//     date.setDate(date.getDate() + i);
//     const dateStr = date.toISOString().split("T")[0];

//     const base = {
//       departureTime: "07:00",
//       arrivalTime: "10:30",
//       date: dateStr,
//       busType: "standard-40",
//       layout: Array(10)
//         .fill(0)
//         .map(() => [0, 0, 0, 0, 0]),
//       reserved: false,
//       reservedBy: null,
//     };

//     services.push({
//       id: `ant-ida-${dateStr}`,
//       route: "antofagasta",
//       direction: "ida",
//       ...base,
//     });

//     services.push({
//       id: `ant-vuelta-${dateStr}`,
//       route: "antofagasta",
//       direction: "vuelta",
//       ...base,
//     });

//     services.push({
//       id: `cal-ida-${dateStr}`,
//       route: "calama",
//       direction: "ida",
//       ...base,
//       busType: "ejecutivo-32",
//       layout: Array(8)
//         .fill(0)
//         .map(() => [0, 0, 0, 0, 0]),
//     });

//     services.push({
//       id: `cal-vuelta-${dateStr}`,
//       route: "calama",
//       direction: "vuelta",
//       ...base,
//       busType: "ejecutivo-32",
//       layout: Array(8)
//         .fill(0)
//         .map(() => [0, 0, 0, 0, 0]),
//     });
//   }

//   return services;
// }

// // ------------------
// // ADAPTADOR: convierte Mock → ApiBusService
// // ------------------
// function mockToApi(service: MockBusService): ApiBusService {
//   return {
//     _id: service.id,
//     origin: service.route === "antofagasta" ? "Antofagasta" : "Calama",
//     destination: service.route === "antofagasta" ? "Calama" : "Antofagasta",
//     date: service.date,
//     template: { time: service.departureTime },
//     seats: service.layout.flatMap((row, rIdx) =>
//       row.map((seat, cIdx) => ({
//         number: rIdx * 5 + cIdx,
//         reservedBy: seat === 1 ? service.reservedBy : null,
//       }))
//     ),
//   };
// }

// // ------------------
// // STORAGE METHODS
// // ------------------
// export function getServices(): ApiBusService[] {
//   const stored = localStorage.getItem("bus_services");

//   if (!stored) {
//     const mocks = initializeMockServices();
//     localStorage.setItem("bus_services", JSON.stringify(mocks));
//     return mocks.map(mockToApi);
//   }

//   const mocks: MockBusService[] = JSON.parse(stored);
//   return mocks.map(mockToApi);
// }

// export function getReservations(): Reservation[] {
//   const stored = localStorage.getItem("reservations");
//   return stored ? JSON.parse(stored) : [];
// }

// export function createReservation(
//   userId: string,
//   serviceId: string,
//   seatNumber: number
// ): Reservation {
//   const reservations = getReservations();
//   const now = new Date();
//   const expires = new Date(now.getTime() + 48 * 60 * 60 * 1000);

//   const reservation: Reservation = {
//     id: `${userId}-${serviceId}-${seatNumber}`,
//     userId,
//     serviceId,
//     seatNumber,
//     reservedAt: now.toISOString(),
//     expiresAt: expires.toISOString(),
//     status: "active",
//   };

//   reservations.push(reservation);
//   localStorage.setItem("reservations", JSON.stringify(reservations));

//   // actualizar mock
//   const stored = localStorage.getItem("bus_services");
//   if (!stored) return reservation;

//   const mocks: MockBusService[] = JSON.parse(stored);
//   const service = mocks.find((s) => s.id === serviceId);

//   if (service) {
//     const row = Math.floor(seatNumber / 5);
//     const col = seatNumber % 5;
//     service.layout[row][col] = 1;
//     service.reserved = true;
//     service.reservedBy = userId;

//     localStorage.setItem("bus_services", JSON.stringify(mocks));
//   }

//   return reservation;
// }

// export function getUserReservations(userId: string): Reservation[] {
//   const reservations = getReservations();
//   const now = new Date();

//   return reservations.filter((r) => {
//     if (r.userId !== userId) return false;
//     if (r.status === "expired") return false;

//     if (new Date(r.expiresAt) < now) {
//       r.status = "expired";
//       return false;
//     }

//     return true;
//   });
// }

// export function cancelReservation(reservationId: string) {
//   const reservations = getReservations();
//   const index = reservations.findIndex((r) => r.id === reservationId);

//   if (index !== -1) {
//     const reservation = reservations[index];
//     reservations.splice(index, 1);
//     localStorage.setItem("reservations", JSON.stringify(reservations));

//     const stored = localStorage.getItem("bus_services");
//     if (!stored) return;

//     const mocks: MockBusService[] = JSON.parse(stored);
//     const service = mocks.find((s) => s.id === reservation.serviceId);

//     if (service) {
//       const row = Math.floor(reservation.seatNumber / 5);
//       const col = reservation.seatNumber % 5;
//       service.layout[row][col] = 0;
//       service.reserved = false;
//       service.reservedBy = null;

//       localStorage.setItem("bus_services", JSON.stringify(mocks));
//     }
//   }
// }

// export function getBusLayouts(): BusLayout[] {
//   return BUS_LAYOUTS;
// }
