import { create } from "zustand";
import type { ApiBusService } from "./booking-types";

interface ServicesState {
  services: ApiBusService[];
  setServices: (s: ApiBusService[]) => void;
  getServiceById: (id: string) => ApiBusService | undefined;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],

  setServices: (s) => set({ services: s }),

  getServiceById: (id) => {
    return get().services.find((srv) => srv._id === id);
  },
}));
