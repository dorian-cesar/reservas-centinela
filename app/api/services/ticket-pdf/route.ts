import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reservationId = searchParams.get("reservationId");
  const token = req.headers.get("cookie")?.split("jwt=")[1];

  if (!reservationId) {
    return NextResponse.json(
      { error: "Missing reservationId" },
      { status: 400 }
    );
  }

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const externalUrl = `${API_URL}/pdf/reservation/${reservationId}/pdf`;

  // Llamamos al backend
  const response = await fetch(externalUrl, {
    method: "GET",
    headers: {
      Accept: "application/pdf",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Error fetching PDF" },
      { status: response.status }
    );
  }

  // Obtenemos PDF como buffer
  const pdfBuffer = await response.arrayBuffer();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="reserva-${reservationId}.pdf"`,
    },
  });
}
