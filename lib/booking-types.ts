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
// API SERVICE
// ------------------
export interface ApiSeat {
  seatNumber: string;
  confirmed: boolean;
  reserved: boolean;
  _id: string;
  reservedBy: string | null;
  reservationId: string | null;
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
  time: string;
  origin: string;
  destination: string;
  busLayout: ApiBusLayout;
  seats: ApiSeat[];
  __v: number;
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
