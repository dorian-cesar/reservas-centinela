"use client";

import type React from "react";

import { AuthGuard } from "@/components/auth-guard";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  return (
    <AuthGuard requireAdmin>
      <UploadContent />
    </AuthGuard>
  );
}

interface ParsedService {
  route: "antofagasta" | "calama";
  direction: "ida" | "vuelta";
  departureTime: string;
  arrivalTime: string;
  date: string;
  busType: string;
}

function UploadContent() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);
  const [previewData, setPreviewData] = useState<ParsedService[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setResult(null);
      parseCSV(selectedFile);
    } else {
      setResult({
        success: false,
        message: "Por favor selecciona un archivo CSV válido",
      });
    }
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim());

      // Skip header
      const dataLines = lines.slice(1);
      const parsed: ParsedService[] = [];

      dataLines.forEach((line) => {
        const [route, direction, departureTime, arrivalTime, date, busType] =
          line.split(",").map((s) => s.trim());

        if (
          route &&
          direction &&
          departureTime &&
          arrivalTime &&
          date &&
          busType
        ) {
          parsed.push({
            route: route.toLowerCase() as "antofagasta" | "calama",
            direction: direction.toLowerCase() as "ida" | "vuelta",
            departureTime,
            arrivalTime,
            date,
            busType,
          });
        }
      });

      setPreviewData(parsed);
    };
    reader.readAsText(file);
  };

  const handleUpload = () => {
    if (!file || previewData.length === 0) return;

    setIsProcessing(true);

    // Simulate upload process
    setTimeout(() => {
      try {
        // Get existing services
        const existingServices = localStorage.getItem("bus_services");
        const services = existingServices ? JSON.parse(existingServices) : [];

        // Add new services
        previewData.forEach((data) => {
          const id = `${data.route}-${data.direction}-${data.date}`;

          // Check if service already exists
          const exists = services.find((s: any) => s.id === id);
          if (!exists) {
            const layout =
              data.busType === "standard-40"
                ? Array(10)
                    .fill(0)
                    .map(() => [0, 0, 0, 0, 0])
                : Array(8)
                    .fill(0)
                    .map(() => [0, 0, 0, 0, 0]);

            services.push({
              id,
              route: data.route,
              direction: data.direction,
              departureTime: data.departureTime,
              arrivalTime: data.arrivalTime,
              date: data.date,
              busType: data.busType,
              layout,
            });
          }
        });

        localStorage.setItem("bus_services", JSON.stringify(services));

        setResult({
          success: true,
          message: "Servicios cargados exitosamente",
          count: previewData.length,
        });

        setIsProcessing(false);

        // Redirect after success
        setTimeout(() => {
          router.push("/admin");
        }, 2000);
      } catch (error) {
        setResult({
          success: false,
          message: "Error al procesar el archivo",
        });
        setIsProcessing(false);
      }
    }, 1500);
  };

  const downloadTemplate = () => {
    const template = `route,direction,departureTime,arrivalTime,date,busType
antofagasta,ida,07:00,10:30,2025-01-20,standard-40
antofagasta,vuelta,18:00,21:30,2025-01-20,standard-40
calama,ida,08:00,10:00,2025-01-21,ejecutivo-32
calama,vuelta,17:00,19:00,2025-01-21,ejecutivo-32`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla_servicios.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center gap-3 md:gap-4">
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
              >
                <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-base md:text-xl font-bold text-white">
                Cargar Servicios
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Importar malla de servicios desde CSV
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        {/* Instructions */}
        <Card className="bg-blue-900/20 border-blue-700/50 p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-blue-300 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 md:w-5 md:h-5" />
            Formato del archivo CSV
          </h3>
          <div className="space-y-2 text-xs md:text-sm text-slate-300 mb-4">
            <p>El archivo debe contener las siguientes columnas:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 md:ml-4">
              <li>
                <strong>route:</strong> antofagasta o calama
              </li>
              <li>
                <strong>direction:</strong> ida o vuelta
              </li>
              <li>
                <strong>departureTime:</strong> HH:MM (ej: 07:00)
              </li>
              <li>
                <strong>arrivalTime:</strong> HH:MM (ej: 10:30)
              </li>
              <li>
                <strong>date:</strong> YYYY-MM-DD (ej: 2025-01-20)
              </li>
              <li>
                <strong>busType:</strong> standard-40 o ejecutivo-32
              </li>
            </ul>
          </div>
          <Button
            onClick={downloadTemplate}
            variant="outline"
            size="sm"
            className="border-blue-600 text-blue-400 hover:bg-blue-900/30 bg-transparent text-xs md:text-sm w-full sm:w-auto"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4 mr-2" />
            Descargar Plantilla CSV
          </Button>
        </Card>

        {/* Upload Section */}
        <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-orange-600/20 mb-4">
              <Upload className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
              Subir archivo CSV
            </h2>
            <p className="text-sm md:text-base text-slate-400">
              Selecciona un archivo para cargar los servicios
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="csv-upload"
              className="flex flex-col items-center justify-center w-full h-48 md:h-64 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer bg-slate-800/30 hover:bg-slate-800/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                <Upload className="w-10 h-10 md:w-12 md:h-12 text-slate-500 mb-3" />
                <p className="mb-2 text-xs md:text-sm text-slate-400 text-center">
                  <span className="font-semibold">Click para seleccionar</span>{" "}
                  o arrastra el archivo
                </p>
                <p className="text-[10px] md:text-xs text-slate-500">
                  Solo archivos CSV
                </p>
                {file && (
                  <div className="mt-4 px-3 md:px-4 py-2 bg-blue-600/20 rounded-lg max-w-full">
                    <p className="text-xs md:text-sm text-blue-400 font-medium truncate">
                      {file.name}
                    </p>
                  </div>
                )}
              </div>
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Preview */}
          {previewData.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base md:text-lg font-bold text-white mb-3">
                Vista previa ({previewData.length} servicios)
              </h3>
              <div className="bg-slate-800/50 rounded-lg p-3 md:p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {previewData.slice(0, 5).map((service, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs md:text-sm py-2 border-b border-slate-700/50 gap-1 sm:gap-0"
                    >
                      <span className="text-slate-300">
                        <strong className="text-white capitalize">
                          {service.route}
                        </strong>{" "}
                        - {service.direction} | {service.date}
                      </span>
                      <span className="text-slate-400">
                        {service.departureTime} - {service.arrivalTime}
                      </span>
                    </div>
                  ))}
                  {previewData.length > 5 && (
                    <p className="text-xs text-slate-500 text-center pt-2">
                      y {previewData.length - 5} servicios más...
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Result Message */}
          {result && (
            <div
              className={`mb-6 p-3 md:p-4 rounded-lg flex items-start md:items-center gap-3 ${
                result.success
                  ? "bg-green-600/20 border border-green-600/50"
                  : "bg-red-600/20 border border-red-600/50"
              }`}
            >
              {result.success ? (
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400 shrink-0 mt-0.5 md:mt-0" />
              ) : (
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 shrink-0 mt-0.5 md:mt-0" />
              )}
              <div>
                <p
                  className={`text-sm md:text-base font-medium ${
                    result.success ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {result.message}
                </p>
                {result.count && (
                  <p className="text-xs md:text-sm text-slate-400 mt-1">
                    Se cargaron {result.count} servicios exitosamente
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || previewData.length === 0 || isProcessing}
            className="w-full bg-linear-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold py-4 md:py-6 text-sm md:text-lg rounded-xl shadow-lg shadow-orange-900/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Cargar Servicios
              </>
            )}
          </Button>
        </Card>

        {/* Bus Types Info */}
        <Card className="bg-slate-900/50 border-slate-800 p-4 md:p-6 mt-4 md:mt-6">
          <h3 className="text-base md:text-lg font-bold text-white mb-4">
            Tipos de Bus Disponibles
          </h3>
          <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-slate-800/50 rounded-lg p-3 md:p-4">
              <h4 className="text-sm md:text-base font-semibold text-blue-400 mb-2">
                standard-40
              </h4>
              <p className="text-xs md:text-sm text-slate-400">
                Bus estándar con 40 asientos (10 filas x 4 asientos)
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3 md:p-4">
              <h4 className="text-sm md:text-base font-semibold text-orange-400 mb-2">
                ejecutivo-32
              </h4>
              <p className="text-xs md:text-sm text-slate-400">
                Bus ejecutivo con 32 asientos (8 filas x 4 asientos)
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
