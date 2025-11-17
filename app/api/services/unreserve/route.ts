import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId, serviceId, seatNumber } = await req.json();

    if (!userId || !serviceId || !seatNumber) {
      return NextResponse.json(
        { error: "Parámetros incompletos" },
        { status: 400 }
      );
    }

    const backendRes = await fetch(
      "https://reserva-centinela.dev-wit.com/api/reservations/release-seat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          serviceId,
          seatNumber,
        }),
      }
    );

    const data = await backendRes.json();
    console.log("Respuesta del backend:", data);

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error || "Error en backend" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno" },
      { status: 500 }
    );
  }
}

// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     const { userId, serviceId, seatNumber } = await req.json();

//     if (!userId || !serviceId || !seatNumber) {
//       return NextResponse.json(
//         { error: "Parámetros incompletos" },
//         { status: 400 }
//       );
//     }

//     const backendRes = await fetch(
//       "https://reserva-centinela.dev-wit.com/api/reservations/release-seat",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ userId, serviceId, seatNumber }),
//       }
//     );

//     const data = await backendRes.json();
//     console.log("Respuesta del backend:", data);

//     // --------------------------
//     //  SI EL BACKEND RESPONDE ERROR
//     // --------------------------
//     if (!backendRes.ok) {
//       return NextResponse.json(
//         {
//           error: data.message || "No se pudo liberar el asiento",
//           timeRemaining: data.timeRemaining,
//           cutoffTime: data.cutoffTime,
//         },
//         { status: backendRes.status }
//       );
//     }

//     // --------------------------
//     // TODO OK
//     // --------------------------
//     return NextResponse.json(data, { status: 200 });
//   } catch (error: any) {
//     console.error("Error en API /unreserve:", error);
//     return NextResponse.json(
//       { error: "Error interno del servidor" },
//       { status: 500 }
//     );
//   }
// }
