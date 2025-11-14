import { NextResponse } from "next/server";

const API_URL = "https://reserva-centinela.dev-wit.com/api/cities/map";

export async function GET() {
  try {
    const res = await fetch(API_URL, { method: "GET" });
    if (!res.ok) {
      return NextResponse.json(
        { error: "Error obteniendo ciudades" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Cities API error:", error);
    return NextResponse.json(
      { error: "Error interno en cities" },
      { status: 500 }
    );
  }
}
