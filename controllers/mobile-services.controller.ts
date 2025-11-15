import { apiGet, apiPatch } from "@/lib/api/base";
import type { ServiceMobileResponseDto } from "@/types/api";

interface ServicesResponse {
  services: ServiceMobileResponseDto[];
}

export const mobileServicesController = {
  getAllServices: async (): Promise<ServiceMobileResponseDto[]> => {
    const response = await apiGet<ServicesResponse | ServiceMobileResponseDto[]>("/services-mobile");
    
    // Handle response structure: { services: [...] } or direct array
    if (Array.isArray(response)) {
      return response;
    }
    
    if (response && typeof response === "object" && "services" in response) {
      return (response as ServicesResponse).services;
    }
    
    // Fallback: return empty array if structure is unexpected
    return [];
  },

  enableOrDisableService: async (
    id: string
  ): Promise<{ message: string }> => {
    return apiPatch(`/services-mobile/enable-or-disable/${id}`);
  },
};

