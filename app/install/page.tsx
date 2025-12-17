"use client";

import { useEffect, useState } from "react";

export default function InstalarAutoPage() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (localStorage.getItem("pwaPrompted") === "true") return;

    const ua = navigator.userAgent.toLowerCase();

    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isSafari =
      isIOS && /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);

    const isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;

    if (isIOS && isSafari && !isInstalled) {
      setShow(true);

      localStorage.setItem("pwaPrompted", "true");
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-9999 bg-black/90 flex flex-col items-center justify-end pb-24 text-white text-center">
      <div className="mb-6 text-xl font-semibold">Instalando Centinela…</div>

      <div className="animate-bounce text-4xl mb-4">⬆️</div>

      <div className="text-lg opacity-80">Toca aquí</div>

      <div className="absolute bottom-6">
        <div className="w-14 h-14 rounded-xl border-2 border-white flex items-center justify-center text-2xl">
          📤
        </div>
      </div>
    </div>
  );
}
