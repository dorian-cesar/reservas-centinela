import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reservationId } = body;
    const token = req.headers.get("cookie")?.split("jwt=")[1];

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    if (!reservationId) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros" },
        { status: 400 }
      );
    }

    const authorizationCode = "centinela";

    const confirmRes = await fetch(API_URL + "/reservations/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ reservationId, authorizationCode }),
    });

    const data = await confirmRes.json();

    if (!confirmRes.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Error al confirmar reserva",
        },
        { status: confirmRes.status }
      );
    }

    return NextResponse.json({ success: true, message: "Reserva confirmada" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: error.message || "Error interno" },
      { status: 500 }
    );
  }
}
