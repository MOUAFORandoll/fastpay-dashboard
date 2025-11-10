import { apiGet, apiPatch } from "@/lib/api/base";
import type { ServiceMobileResponseDto } from "@/types/api";

export const mobileServicesController = {
  getAllServices: async (): Promise<ServiceMobileResponseDto[]> => {
    return apiGet<ServiceMobileResponseDto[]>("/services-mobile");
  },

  enableOrDisableService: async (
    id: string
  ): Promise<{ message: string }> => {
    return apiPatch(`/services-mobile/enable-or-disable/${id}`);
  },
};

