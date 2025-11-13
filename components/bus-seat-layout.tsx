"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Armchair, Minimize2 } from "lucide-react";

interface BusSeatLayoutProps {
  layout: number[][];
  onSeatSelect: (seatNumber: number) => void;
  selectedSeat: number | null;
  userReservedSeat?: number;
}

export function BusSeatLayout({
  layout,
  onSeatSelect,
  selectedSeat,
  userReservedSeat,
}: BusSeatLayoutProps) {
  const [hoveredSeat, setHoveredSeat] = useState<number | null>(null);

  const getSeatNumber = (rowIndex: number, colIndex: number): number | null => {
    if (colIndex === 2) return null;
    const seatsBeforeRow = rowIndex * 4;
    const seatInRow = colIndex > 2 ? colIndex - 1 : colIndex;
    return seatsBeforeRow + seatInRow;
  };

  const getSeatStatus = (rowIndex: number, colIndex: number) => {
    const seatValue = layout[rowIndex][colIndex];
    const seatNumber = getSeatNumber(rowIndex, colIndex);

    if (seatNumber === null) return "aisle";
    if (seatNumber === userReservedSeat) return "user-reserved";
    if (seatValue === 0) return "available";
    if (seatValue === 1) return "reserved";
    return "occupied";
  };

  const getSeatClasses = (status: string, seatNumber: number | null) => {
    const isSelected = seatNumber === selectedSeat;
    const isHovered = seatNumber === hoveredSeat;

    if (status === "aisle") return "bg-transparent";

    if (status === "user-reserved") {
      return "bg-green-600 text-white border-2 border-green-400 cursor-not-allowed shadow-lg shadow-green-900/50";
    }

    if (status === "available") {
      return cn(
        "bg-slate-800 text-slate-400 border-2 border-slate-700 cursor-pointer transition-all duration-300 relative overflow-hidden",
        "hover:bg-blue-700 hover:border-blue-500 hover:text-white hover:scale-105 hover:shadow-lg hover:shadow-blue-900/50",
        isSelected &&
          "bg-orange-600 border-orange-400 text-white scale-110 shadow-lg shadow-orange-900/50",
        isHovered && !isSelected && "scale-105"
      );
    }

    return "bg-slate-700/30 text-slate-600 border-2 border-slate-700/50 cursor-not-allowed";
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Sección del conductor */}
      <div className="mb-6 md:mb-8 flex items-center justify-between bg-slate-800/50 rounded-t-3xl p-4 md:p-6 border-2 border-slate-700">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-linear-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-900 border-2 border-blue-400"></div>
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
              {row.map((_, colIndex) => {
                const seatNumber = getSeatNumber(rowIndex, colIndex);
                const status = getSeatStatus(rowIndex, colIndex);

                if (colIndex === 2) {
                  return (
                    <div
                      key={colIndex}
                      className="w-10 md:w-12 flex items-center justify-center"
                    >
                      <Minimize2 className="w-3 h-3 md:w-4 md:h-4 text-slate-700 rotate-90" />
                    </div>
                  );
                }

                return (
                  <button
                    key={colIndex}
                    onClick={() => {
                      if (status === "available" && seatNumber !== null) {
                        onSeatSelect(seatNumber);
                      }
                    }}
                    onMouseEnter={() =>
                      seatNumber !== null && setHoveredSeat(seatNumber)
                    }
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={status !== "available"}
                    className={cn(
                      // quitamos justify-between → usamos justify-center y gap
                      "w-11 h-11 md:w-14 md:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 font-bold text-xs relative select-none",
                      getSeatClasses(status, seatNumber)
                    )}
                  >
                    {status !== "aisle" && (
                      <>
                        {/* Número arriba */}
                        <span className="text-[10px] md:text-xs font-semibold text-white/80 leading-none">
                          {seatNumber !== null && seatNumber + 1}
                        </span>

                        {/* Icono del asiento */}
                        <Armchair className="w-4 h-4 md:w-5 md:h-5 opacity-90" />
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Leyenda */}
        <div className="mt-10 md:mt-12 pt-4 md:pt-6 border-t border-slate-800">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {[
              ["bg-slate-800 border-slate-700 text-slate-400", "Disponible"],
              ["bg-slate-700/30 border-slate-700/50 text-slate-600", "Ocupado"],
              ["bg-orange-600 border-orange-400 text-white", "Seleccionado"],
              ["bg-green-600 border-green-400 text-white", "Tu reserva"],
            ].map(([classes, label], i) => (
              <div key={i} className="flex items-center gap-2 md:gap-3">
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 flex items-center justify-center shrink-0 ${classes}`}
                >
                  <Armchair className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-xs md:text-sm text-slate-400">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
