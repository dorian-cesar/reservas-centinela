import { NextResponse } from "next/server";

const API_URL = "https://reserva-centinela.dev-wit.com/api/cities/map";

// Cache en memoria (por instancia del servidor)
let cachedCities: any = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 0.5; // 30 segundos

export async function GET() {
  try {
    const now = Date.now();

    // Si está cacheado y no ha expirado → devolver cache
    if (cachedCities && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json(cachedCities);
    }

    // Llamada real a la API externa
    const res = await fetch(API_URL, { method: "GET" });

    if (!res.ok) {
      return NextResponse.json(
        { error: "Error obteniendo ciudades" },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Guardar en cache
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
