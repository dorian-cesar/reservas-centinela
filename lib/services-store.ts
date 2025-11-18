import { create } from "zustand";
import type { ApiBusService } from "./booking-types";

interface ServicesState {
  services: ApiBusService[];
  selectedService: ApiBusService | null;
  setServices: (s: ApiBusService[]) => void;
  setSelectedService: (
    serviceOrFn:
      | ApiBusService
      | null
      | ((prev: ApiBusService | null) => ApiBusService | null)
  ) => void;
  getServiceById: (id: string) => ApiBusService | undefined;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  selectedService: null,

  setServices: (s) => set({ services: s }),

  setSelectedService: (serviceOrFn) =>
    set((state) => ({
      selectedService:
        typeof serviceOrFn === "function"
          ? serviceOrFn(state.selectedService)
          : serviceOrFn,
    })),

  getServiceById: (id) => {
    return get().services.find((srv) => srv._id === id);
  },
}));
