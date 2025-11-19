import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Cache en memoria (por instancia del servidor)
let cachedCities: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 0.5; // 30 segundos

export async function GET() {
  try {
    const now = Date.now();

    if (cachedCities && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json(cachedCities);
    }

    // Llamada real a la API externa
    const res = await fetch(API_URL + "/cities/map", { method: "GET" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error obteniendo ciudades" },
        { status: res.status }
      );
    }

    const data = await res.json();

    cachedCities = data;
    lastFetchTime = now;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Cities API error:", error);
    return NextResponse.json(
      { error: "Error interno en cities" },
      { status: 500 }
    );
  }
}
