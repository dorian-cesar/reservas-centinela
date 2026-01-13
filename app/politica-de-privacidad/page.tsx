"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function PoliticaDePrivacidadPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="container mx-auto px-3 md:px-4 py-6 md:py-10">
        <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800 rounded-xl p-4 md:p-6 lg:p-8 shadow-xl">
          {/* HEADER */}
          <header className="mb-6 md:mb-8">
            <button
              onClick={() => router.back()}
              className="mb-3 inline-flex items-center gap-1.5 text-xs md:text-sm text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </button>

            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
              Política de Privacidad
            </h1>
            <p className="mt-1 text-xs md:text-sm text-slate-400">
              Sistema de Reservas de Pasajes
            </p>
            <p className="mt-2 text-[11px] md:text-xs text-slate-500">
              Última actualización: {new Date().toLocaleDateString("es-CL")}
            </p>
          </header>

          {/* CONTENT */}
          <section className="space-y-5 md:space-y-6 text-slate-200 text-sm md:text-base leading-relaxed">
            <p>
              La presente Política de Privacidad describe cómo se recopila,
              utiliza y protege la información personal de los usuarios que
              acceden y utilizan esta plataforma de reservas de pasajes (en
              adelante, la “Plataforma”).
            </p>

            <p>
              Al registrarse y utilizar la Plataforma, el usuario declara haber
              leído y aceptado esta Política de Privacidad.
            </p>

            {/* SECTION */}
            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                1. Información recopilada
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>RUT</li>
                <li>Correo electrónico</li>
                <li>Credenciales de acceso (almacenadas de forma cifrada)</li>
                <li>Datos asociados a la reserva del pasaje</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                2. Finalidad del tratamiento
              </h2>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                <li>Autenticar y gestionar usuarios</li>
                <li>Permitir la reserva de un pasaje por usuario</li>
                <li>Administrar y validar reservas</li>
                <li>Comunicar información relevante del servicio</li>
                <li>Garantizar la seguridad del sistema</li>
              </ul>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                3. Base legal
              </h2>
              <p className="text-slate-300">
                El tratamiento de los datos personales se realiza sobre la base
                del consentimiento del usuario y la ejecución del servicio
                solicitado.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                4. Seguridad de la información
              </h2>
              <p className="text-slate-300">
                La información es almacenada en sistemas seguros, aplicando
                medidas técnicas y organizativas razonables para prevenir
                accesos no autorizados, pérdida o alteración de los datos.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                5. Compartición de datos
              </h2>
              <p className="text-slate-300">
                Los datos personales no serán compartidos con terceros, salvo
                cuando exista una obligación legal o sea estrictamente necesario
                para la operación técnica del sistema.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                6. Conservación de datos
              </h2>
              <p className="text-slate-300">
                Los datos se conservarán mientras el usuario mantenga una cuenta
                activa o durante el tiempo necesario para cumplir con las
                finalidades descritas.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                7. Derechos del usuario
              </h2>
              <p className="text-slate-300">
                El usuario podrá solicitar el acceso, rectificación o
                eliminación de sus datos personales, así como retirar su
                consentimiento para el tratamiento de los mismos.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                8. Uso de cookies
              </h2>
              <p className="text-slate-300">
                La Plataforma utiliza únicamente cookies técnicas necesarias
                para el correcto funcionamiento del sistema y la gestión de
                sesiones.
              </p>
            </div>

            <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                9. Modificaciones
              </h2>
              <p className="text-slate-300">
                La presente Política podrá ser modificada en cualquier momento.
                Los cambios serán publicados en esta misma página.
              </p>
            </div>

            {/* <div>
              <h2 className="text-base md:text-lg font-semibold text-white mb-2">
                10. Contacto
              </h2>
              <p className="text-slate-300">
                Para consultas relacionadas con esta Política de Privacidad,
                puede contactarse a:
              </p>
              <p className="mt-1 text-slate-200 font-medium">
                contacto@tandemindustrial.cl
              </p>
            </div> */}
          </section>
        </div>
      </main>
    </div>
  );
}
