import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader.split("jwt=")[1]?.split(";")[0];

  if (!token) {
    const response = NextResponse.json(
      { message: "Token inválido" },
      { status: 401 }
    );

    response.headers.set(
      "Set-Cookie",
      "jwt=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"
    );

    return response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Falta userId en la query" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(
      `${API_URL}/reservations/user/${userId}/confirmed`,
      { method: "GET", headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await backendRes.json();
    console.log("Respuesta del backend:", data);

    if (data?.message === "Token inválido") {
      const response = NextResponse.json(data, { status: 401 });

      response.headers.set(
        "Set-Cookie",
        "jwt=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict"
      );

      return response;
    }

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.message || "Error desde backend" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Error interno" },
      { status: 500 }
    );
  }
}
