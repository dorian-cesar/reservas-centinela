import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reservationId = searchParams.get("reservationId");
  const token = req.headers.get("cookie")?.split("jwt=")[1]?.split(";")[0];

  if (!reservationId) {
    return NextResponse.json(
      { error: "Missing reservationId" },
      { status: 400 }
    );
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const url = `${API_URL}/pdf/reservation/${reservationId}/pdf`;

  // Llamar backend
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Error obteniendo PDF" },
      { status: response.status }
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="pasaje-${reservationId}.pdf"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
