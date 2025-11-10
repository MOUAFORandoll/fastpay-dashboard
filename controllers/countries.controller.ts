import { apiGet, apiPatch, apiDelete } from "@/lib/api/base";
import type { CountryResponseDto } from "@/types/api";

export const countriesController = {
  getAllCountries: async (): Promise<CountryResponseDto[]> => {
    return apiGet<CountryResponseDto[]>("/country");
  },

  enableTransactions: async (id: string): Promise<{ message: string }> => {
    return apiPatch(`/country/${id}/enable-transactions`);
  },

  disableTransactions: async (id: string): Promise<{ message: string }> => {
    return apiPatch(`/country/${id}/disable-transactions`);
  },

  deleteCountry: async (id: string): Promise<{ message: string }> => {
    return apiDelete(`/country/${id}`);
  },
};

