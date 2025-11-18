import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let email, password;
  try {
    const body = await req.json();
    email = body.email;
    password = body.password;
  } catch (error) {
    console.error("Error al parsear el cuerpo de la petición:", error);
    return NextResponse.json(
      { error: "Formato de petición JSON inválido." },
      { status: 400 }
    );
  }

  if (!email || !password) {
    return NextResponse.json(
      { error: "Faltan credenciales: 'email' y 'password' son requeridos." },
      { status: 400 }
    );
  }

  const apiUrl = "https://reserva-centinela.dev-wit.com/api/auth/login";

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      let errorMessage = "Error en la autenticación.";
      let status = res.status;

      try {
        const errorData = await res.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {}

      return NextResponse.json(
        { error: errorMessage },
        { status: status >= 400 && status < 500 ? status : 401 }
      );
    }

    const data = await res.json();
    const token = data.token;

    if (!token) {
      console.error("Respuesta exitosa del backend pero falta el token.", data);
      return NextResponse.json(
        {
          error:
            "Error interno del servidor: Token de autenticación no recibido.",
        },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ user: data.user });

    response.cookies.set("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return response;
  } catch (error) {
    console.error("Error durante la petición de login:", error);
    return NextResponse.json(
      { error: "Error de conexión con el servidor de autenticación." },
      { status: 500 }
    );
  }
}
