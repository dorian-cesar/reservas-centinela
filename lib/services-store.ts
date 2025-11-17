import { create } from "zustand";
import type { ApiBusService } from "./booking-types";

interface ServicesState {
  services: ApiBusService[];
  selectedService: ApiBusService | null;
  setServices: (s: ApiBusService[]) => void;
  setSelectedService: (service: ApiBusService | null) => void;
  getServiceById: (id: string) => ApiBusService | undefined;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  selectedService: null,

  setServices: (s) => set({ services: s }),

  setSelectedService: (service) => set({ selectedService: service }),

  getServiceById: (id) => {
    return get().services.find((srv) => srv._id === id);
  },
}));
