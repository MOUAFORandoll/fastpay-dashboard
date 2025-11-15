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
        let data: Beneficiary[] = [];
        let total = 0;
        let page = params?.page || 1;
        let size = params?.size || 10;

        if (response && typeof response === "object") {
          // Check for paginated structure: { beneficiaires: { content: [...], page, size, total } }
          const beneficiaires = (response as { beneficiaires?: { content?: Beneficiary[]; page?: number; size?: number; total?: number } })?.beneficiaires;
          if (beneficiaires) {
            data = Array.isArray(beneficiaires.content) ? beneficiaires.content : [];
            total = beneficiaires.total || 0;
            page = beneficiaires.page || page;
            size = beneficiaires.size || size;
          } else {
            // Fallback to English spelling
            const beneficiaries = (response as { beneficiaries?: { content?: Beneficiary[]; page?: number; size?: number; total?: number } })?.beneficiaries;
            if (beneficiaries) {
              data = Array.isArray(beneficiaries.content) ? beneficiaries.content : [];
              total = beneficiaries.total || 0;
              page = beneficiaries.page || page;
              size = beneficiaries.size || size;
            } else if (Array.isArray(response)) {
              // Fallback: if response is directly an array
              data = response;
              total = data.length;
            } else if ((response as { data?: Beneficiary[] })?.data) {
              // Fallback: check for data property
              data = (response as { data?: Beneficiary[] })?.data || [];
              total = data.length;
            } else if ((response as { beneficiaries?: Beneficiary[] })?.beneficiaries) {
              // Fallback: check for beneficiaries array property
              data = (response as { beneficiaries?: Beneficiary[] })?.beneficiaries || [];
              total = data.length;
            }
          }
        } else if (Array.isArray(response)) {
          data = response;
          total = data.length;
        }

        set({
          beneficiaries: data,
          isLoading: false,
          pagination: {
            page,
            size,
            total,
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
        let data: Beneficiary[] = [];
        let total = 0;
        let page = params?.page || 1;
        let size = params?.size || 10;

        if (response && typeof response === "object") {
          // Check for paginated structure: { beneficiaires: { content: [...], page, size, total } }
          const beneficiaires = (response as { beneficiaires?: { content?: Beneficiary[]; page?: number; size?: number; total?: number } })?.beneficiaires;
          if (beneficiaires) {
            data = Array.isArray(beneficiaires.content) ? beneficiaires.content : [];
            total = beneficiaires.total || 0;
            page = beneficiaires.page || page;
            size = beneficiaires.size || size;
          } else {
            // Fallback to English spelling
            const beneficiaries = (response as { beneficiaries?: { content?: Beneficiary[]; page?: number; size?: number; total?: number } })?.beneficiaries;
            if (beneficiaries) {
              data = Array.isArray(beneficiaries.content) ? beneficiaries.content : [];
              total = beneficiaries.total || 0;
              page = beneficiaries.page || page;
              size = beneficiaries.size || size;
            } else if (Array.isArray(response)) {
              // Fallback: if response is directly an array
              data = response;
              total = data.length;
            } else if ((response as { data?: Beneficiary[] })?.data) {
              // Fallback: check for data property
              data = (response as { data?: Beneficiary[] })?.data || [];
              total = data.length;
            } else if ((response as { beneficiaries?: Beneficiary[] })?.beneficiaries) {
              // Fallback: check for beneficiaries array property
              data = (response as { beneficiaries?: Beneficiary[] })?.beneficiaries || [];
              total = data.length;
            }
          }
        } else if (Array.isArray(response)) {
          data = response;
          total = data.length;
        }

        set({
          beneficiaries: data,
          isLoading: false,
          pagination: {
            page,
            size,
            total,
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
        let data: Beneficiary[] = [];
        let total = 0;
        let page = params?.page || 1;
        let size = params?.size || 10;

        if (response && typeof response === "object") {
          // Check for paginated structure: { beneficiaires: { content: [...], page, size, total } }
          const beneficiaires = (response as { beneficiaires?: { content?: Beneficiary[]; page?: number; size?: number; total?: number } })?.beneficiaires;
          if (beneficiaires) {
            data = Array.isArray(beneficiaires.content) ? beneficiaires.content : [];
            total = beneficiaires.total || 0;
            page = beneficiaires.page || page;
            size = beneficiaires.size || size;
          } else {
            // Fallback to English spelling
            const beneficiaries = (response as { beneficiaries?: { content?: Beneficiary[]; page?: number; size?: number; total?: number } })?.beneficiaries;
            if (beneficiaries) {
              data = Array.isArray(beneficiaries.content) ? beneficiaries.content : [];
              total = beneficiaries.total || 0;
              page = beneficiaries.page || page;
              size = beneficiaries.size || size;
            } else if (Array.isArray(response)) {
              // Fallback: if response is directly an array
              data = response;
              total = data.length;
            } else if ((response as { data?: Beneficiary[] })?.data) {
              // Fallback: check for data property
              data = (response as { data?: Beneficiary[] })?.data || [];
              total = data.length;
            } else if ((response as { beneficiaries?: Beneficiary[] })?.beneficiaries) {
              // Fallback: check for beneficiaries array property
              data = (response as { beneficiaries?: Beneficiary[] })?.beneficiaries || [];
              total = data.length;
            }
          }
        } else if (Array.isArray(response)) {
          data = response;
          total = data.length;
        }

        set({
          beneficiaries: data,
          isLoading: false,
          pagination: {
            page,
            size,
            total,
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

