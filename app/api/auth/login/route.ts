import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const res = await fetch(
    "https://reserva-centinela.dev-wit.com/api/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const data = await res.json();

  // El backend te entrega: { user, token }
  const token = data.token;

  const response = NextResponse.json({ user: data.user });

  // Guardamos token en cookie HttpOnly
  response.cookies.set("jwt", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
