import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/base";
import type {
  CreateBeneficiaireDto,
  UpdateBeneficiaireDto,
} from "@/types/api";

export const beneficiariesController = {
  createBeneficiary: async (
    data: CreateBeneficiaireDto
  ): Promise<{ message: string }> => {
    return apiPost("/beneficiaires", data);
  },

  getAllBeneficiaries: async (params?: {
    page?: number;
    size?: number;
  }): Promise<unknown> => {
    return apiGet("/beneficiaires", params);
  },

  getMyBeneficiaries: async (params?: {
    page?: number;
    size?: number;
  }): Promise<unknown> => {
    return apiGet("/beneficiaires/me", params);
  },

  getBeneficiariesByOrganisation: async (
    organisation: string,
    params?: { page?: number; size?: number }
  ): Promise<unknown> => {
    return apiGet(`/beneficiaires/${organisation}`, params);
  },

  updateBeneficiary: async (
    id: string,
    data: UpdateBeneficiaireDto
  ): Promise<{ message: string }> => {
    return apiPatch(`/beneficiaires/${id}`, data);
  },

  deleteBeneficiary: async (id: string): Promise<{ message: string }> => {
    return apiDelete(`/beneficiaires/${id}`);
  },
};

