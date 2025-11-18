import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function toChileDate(dateStr: string) {
  return new Date(
    new Date(dateStr).toLocaleString("en-CL", { timeZone: "America/Santiago" })
  );
}

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Body JSON inválido" },
        { status: 400 }
      );
    }

    const { userId, serviceId, seatNumber, serviceDepartureDateTime } =
      body || {};

    if (!userId || !serviceId || !seatNumber || !serviceDepartureDateTime) {
      return NextResponse.json(
        { error: "Parámetros incompletos" },
        { status: 400 }
      );
    }

    // --- VALIDACIÓN 48 HORAS ---
    const nowChile = toChileDate(new Date().toISOString());
    const departureChile = toChileDate(serviceDepartureDateTime);

    const diffMs = departureChile.getTime() - nowChile.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 48) {
      return NextResponse.json(
        {
          error:
            "No puedes liberar el asiento. Faltan menos de 48 horas para la salida.",
          hoursToDeparture: diffHours,
        },
        { status: 400 }
      );
    }

    const backendRes = await fetch(API_URL + "/reservations/release-seat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        serviceId,
        seatNumber,
      }),
    });

    let data;
    try {
      data = await backendRes.json();
    } catch {
      return NextResponse.json(
        { error: "Respuesta inválida del backend" },
        { status: 502 }
      );
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error || "Error en backend" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error interno" },
      { status: 500 }
    );
  }
}
