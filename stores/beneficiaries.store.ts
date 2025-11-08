import { create } from "zustand";
import { beneficiariesController } from "@/controllers/beneficiaries.controller";
import type {
  CreateBeneficiaireDto,
  UpdateBeneficiaireDto,
} from "@/types/api";

interface Beneficiary {
  id: string;
  name: string;
  phone: string;
  country_id: string;
  code_phone?: string;
  [key: string]: unknown;
}

interface BeneficiariesState {
  beneficiaries: Beneficiary[];
  selectedBeneficiary: Beneficiary | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  fetchAllBeneficiaries: (params?: {
    page?: number;
    size?: number;
  }) => Promise<void>;
  fetchMyBeneficiaries: (params?: {
    page?: number;
    size?: number;
  }) => Promise<void>;
  fetchBeneficiariesByOrganisation: (
    organisation: string,
    params?: { page?: number; size?: number }
  ) => Promise<void>;
  createBeneficiary: (data: CreateBeneficiaireDto) => Promise<void>;
  updateBeneficiary: (
    id: string,
    data: UpdateBeneficiaireDto
  ) => Promise<void>;
  deleteBeneficiary: (id: string) => Promise<void>;
  setSelectedBeneficiary: (beneficiary: Beneficiary | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useBeneficiariesStore = create<BeneficiariesState>(
  (set, get) => ({
    beneficiaries: [],
    selectedBeneficiary: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      size: 10,
      total: 0,
    },

    fetchAllBeneficiaries: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const response = await beneficiariesController.getAllBeneficiaries(
          params
        );
        const data = Array.isArray(response)
          ? response
          : (response as { data?: Beneficiary[]; beneficiaries?: Beneficiary[] })
              ?.data ||
            (response as { data?: Beneficiary[]; beneficiaries?: Beneficiary[] })
              ?.beneficiaries ||
            [];
        set({
          beneficiaries: data,
          isLoading: false,
          pagination: {
            page: params?.page || 1,
            size: params?.size || 10,
            total: (response as { total?: number })?.total || data.length,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch beneficiaries";
        set({ isLoading: false, error: errorMessage });
      }
    },

    fetchMyBeneficiaries: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const response = await beneficiariesController.getMyBeneficiaries(
          params
        );
        const data = Array.isArray(response)
          ? response
          : (response as { data?: Beneficiary[]; beneficiaries?: Beneficiary[] })
              ?.data ||
            (response as { data?: Beneficiary[]; beneficiaries?: Beneficiary[] })
              ?.beneficiaries ||
            [];
        set({
          beneficiaries: data,
          isLoading: false,
          pagination: {
            page: params?.page || 1,
            size: params?.size || 10,
            total: (response as { total?: number })?.total || data.length,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch beneficiaries";
        set({ isLoading: false, error: errorMessage });
      }
    },

    fetchBeneficiariesByOrganisation: async (organisation, params) => {
      set({ isLoading: true, error: null });
      try {
        const response =
          await beneficiariesController.getBeneficiariesByOrganisation(
            organisation,
            params
          );
        const data = Array.isArray(response)
          ? response
          : (response as { data?: Beneficiary[]; beneficiaries?: Beneficiary[] })
              ?.data ||
            (response as { data?: Beneficiary[]; beneficiaries?: Beneficiary[] })
              ?.beneficiaries ||
            [];
        set({
          beneficiaries: data,
          isLoading: false,
          pagination: {
            page: params?.page || 1,
            size: params?.size || 10,
            total: (response as { total?: number })?.total || data.length,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch beneficiaries";
        set({ isLoading: false, error: errorMessage });
      }
    },

    createBeneficiary: async (data) => {
      set({ isLoading: true, error: null });
      try {
        await beneficiariesController.createBeneficiary(data);
        await get().fetchMyBeneficiaries();
        set({ isLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create beneficiary";
        set({ isLoading: false, error: errorMessage });
        throw error;
      }
    },

    updateBeneficiary: async (id, data) => {
      set({ isLoading: true, error: null });
      try {
        await beneficiariesController.updateBeneficiary(id, data);
        await get().fetchMyBeneficiaries();
        set({ isLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update beneficiary";
        set({ isLoading: false, error: errorMessage });
        throw error;
      }
    },

    deleteBeneficiary: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await beneficiariesController.deleteBeneficiary(id);
        set({
          beneficiaries: get().beneficiaries.filter((b) => b.id !== id),
          isLoading: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete beneficiary";
        set({ isLoading: false, error: errorMessage });
        throw error;
      }
    },

    setSelectedBeneficiary: (beneficiary) => {
      set({ selectedBeneficiary: beneficiary });
    },

    clearError: () => {
      set({ error: null });
    },

    reset: () => {
      set({
        beneficiaries: [],
        selectedBeneficiary: null,
        isLoading: false,
        error: null,
        pagination: {
          page: 1,
          size: 10,
          total: 0,
        },
      });
    },
  })
);

