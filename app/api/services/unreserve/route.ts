import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

    const { userId, serviceId, seatNumber } = body || {};

    if (!userId || !serviceId || !seatNumber) {
      return NextResponse.json(
        { error: "Parámetros incompletos" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(API_URL + "/reservations/release-seat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, serviceId, seatNumber }),
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
