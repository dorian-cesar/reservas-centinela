"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Armchair, Minimize2, Toilet } from "lucide-react";
import type { ApiSeat } from "@/lib/booking-types";

interface BusSeatLayoutProps {
  layout: string[][];
  seats: ApiSeat[];
  onSeatSelect: (seatNumber: string) => void;
  selectedSeat: string | null;
  userReservedSeat?: string;
}

export function BusSeatLayout({
  layout,
  seats,
  onSeatSelect,
  selectedSeat,
  userReservedSeat,
}: BusSeatLayoutProps) {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const getSeatStatus = (seatValue: string) => {
    if (!seatValue) return "aisle";
    if (seatValue === "WC") return "wc";
    if (seatValue === userReservedSeat) return "user-reserved";

    const seat = seats.find((s) => s.seatNumber === seatValue);
    if (seat?.reserved) return "reserved";

    return "available";
  };

  const getSeatClasses = (status: string, seatNumber: string | null) => {
    const isSelected = seatNumber === selectedSeat;
    const isHovered = seatNumber === hoveredSeat;

    switch (status) {
      case "aisle":
        return "bg-transparent";
      case "wc":
        return cn(
          "bg-blue-500/40 text-white border-2 border-blue-400/40 cursor-not-allowed",
          "flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl"
        );
      case "user-reserved":
        return "bg-green-600 text-white border-2 border-green-400 cursor-not-allowed shadow-lg shadow-green-900/50";
      case "available":
        return cn(
          "bg-slate-800 text-slate-400 border-2 border-slate-700 cursor-pointer transition-all duration-300 relative overflow-hidden",
          "hover:bg-blue-700 hover:border-blue-500 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-900/50",
          isSelected &&
            "bg-orange-600 border-orange-400 text-white scale-110 shadow-lg shadow-orange-900/50",
          isHovered && !isSelected && "scale-105"
        );
      case "reserved":
        return "bg-slate-900/50 text-slate-700 border-2 border-slate-800 cursor-not-allowed shadow-inner";
      default:
        return "bg-slate-700/30 text-slate-600 border-2 border-slate-700/50 cursor-not-allowed";
    }
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Sección del conductor */}
      <div className="mb-3 flex items-right bg-slate-800/50 rounded-t-3xl p-4 md:p-6 border-2 border-slate-700">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-400"></div>
          </div>
          <span className="text-sm md:text-base text-slate-400 font-medium">
            Conductor
          </span>
        </div>
      </div>

      {/* Grid de asientos */}
      <div className="bg-slate-900/70 rounded-3xl p-4 md:p-8 border-2 border-slate-800 shadow-2xl">
        <div className="space-y-3 md:space-y-4">
          {layout.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-2 md:gap-3 justify-center">
              {row.map((seatValue, colIndex) => {
                const status = getSeatStatus(seatValue);

                if (!seatValue || seatValue === "WC") {
                  return (
                    <button
                      key={colIndex}
                      disabled
                      className={getSeatClasses(status, seatValue)}
                    >
                      {seatValue === "WC" ? (
                        <Toilet className="w-4 h-4 md:w-5 md:h-5 opacity-90" />
                      ) : (
                        <Minimize2 className="w-3 h-3 md:w-4 md:h-4 text-slate-700 rotate-90" />
                      )}
                      {seatValue && seatValue !== "WC" && (
                        <span className="text-[10px] md:text-xs font-semibold text-white/80 leading-none">
                          {seatValue}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <button
                    key={colIndex}
                    onClick={() => onSeatSelect(seatValue)}
                    onMouseEnter={() => setHoveredSeat(seatValue)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={status !== "available"}
                    className={cn(
                      "w-11 h-11 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 font-bold text-xs relative select-none",
                      getSeatClasses(status, seatValue)
                    )}
                  >
                    <span className="text-[10px] md:text-xs font-semibold text-white/80 leading-none">
                      {seatValue}
                    </span>
                    <Armchair className="w-4 h-4 md:w-5 md:h-5 opacity-90" />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Leyenda */}
      <div className="mt-10 md:mt-12 pt-4 md:pt-6 border-t border-slate-800">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {[
            [
              "bg-slate-800 border-slate-700 text-slate-400",
              "Disponible",
              "armchair",
            ],
            [
              "bg-slate-700/30 border-slate-700/50 text-slate-600",
              "Ocupado",
              "armchair",
            ],
            [
              "bg-orange-600 border-orange-400 text-white",
              "Seleccionado",
              "armchair",
            ],
            [
              "bg-green-600 border-green-400 text-white",
              "Tu reserva",
              "armchair",
            ],
            ["bg-blue-500/40 border-blue-400/40 text-white", "Baño", "toilet"],
          ].map(([classes, label, type], i) => (
            <div key={i} className="flex items-center gap-2 md:gap-3">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 flex items-center justify-center shrink-0 ${classes}`}
              >
                {type === "toilet" ? (
                  <Toilet className="w-4 h-4 md:w-5 md:h-5" />
                ) : (
                  <Armchair className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </div>
              <span className="text-xs md:text-sm text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
