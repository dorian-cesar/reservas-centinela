import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");

  const token = req.headers.get("cookie")?.split("jwt=")[1];

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const apiRes = await fetch(
    `${API_URL}/services/search?origin=${origin}&destination=${destination}&date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await apiRes.json();

  return NextResponse.json(data);
}
