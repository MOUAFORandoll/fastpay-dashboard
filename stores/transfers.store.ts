import { create } from "zustand";
import { transfersController } from "@/controllers/transfers.controller";
import type { CreateTransfertDto } from "@/types/api";

interface Transfer {
  id: string;
  amount: number;
  reference?: string;
  status?: string;
  createdAt?: string;
  beneficiary?: {
    id: string;
    name?: string | null;
    phone?: string;
    [key: string]: unknown;
  };
  service_mobile?: {
    id: string;
    name?: string;
    country?: string;
    code_prefix?: string;
    api_endpoint?: string | null;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface TransfersState {
  transfers: Transfer[];
  selectedTransfer: Transfer | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  fetchTransfers: (params?: { page?: number; size?: number }) => Promise<void>;
  fetchTransferById: (id: string) => Promise<void>;
  sendTransferOtp: () => Promise<void>;
  initializeTransfer: (data: CreateTransfertDto) => Promise<void>;
  setSelectedTransfer: (transfer: Transfer | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useTransfersStore = create<TransfersState>((set, get) => ({
  transfers: [],
  selectedTransfer: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    size: 10,
    total: 0,
  },

  fetchTransfers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await transfersController.getAllTransfers(params);
      let data: Transfer[] = [];
      let total = 0;
      let page = params?.page || 1;
      let size = params?.size || 10;

      if (response && typeof response === "object") {
        // Check for paginated structure: { transferts: { content: [...], page, size, total } }
        const transferts = (response as { transferts?: { content?: Transfer[]; page?: number; size?: number; total?: number } })?.transferts;
        if (transferts) {
          data = Array.isArray(transferts.content) ? transferts.content : [];
          total = transferts.total || 0;
          page = transferts.page || page;
          size = transferts.size || size;
        } else {
          // Fallback to other structures for backward compatibility
          const transfertsCamel = (response as { transferts?: { content?: Transfer[]; page?: number; size?: number; total?: number } })?.transferts;
          if (transfertsCamel) {
            data = Array.isArray(transfertsCamel.content) ? transfertsCamel.content : [];
            total = transfertsCamel.total || 0;
            page = transfertsCamel.page || page;
            size = transfertsCamel.size || size;
          } else if (Array.isArray(response)) {
            data = response;
            total = data.length;
          } else if ((response as { data?: Transfer[] })?.data) {
            data = (response as { data?: Transfer[] })?.data || [];
            total = data.length;
          }
        }
      } else if (Array.isArray(response)) {
        data = response;
        total = data.length;
      }

      set({
        transfers: data,
        isLoading: false,
        pagination: {
          page,
          size,
          total,
        },
      });
    } catch (error) {
      // Error is already handled by API base (toast shown, logged to console)
      // Set transfers to empty array on error
      set({ transfers: [], isLoading: false, error: null });
    }
  },

  fetchTransferById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const transfer = await transfersController.getTransferById(id);
      set({
        selectedTransfer: transfer as Transfer,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch transfer";
      set({ isLoading: false, error: errorMessage });
    }
  },

  sendTransferOtp: async () => {
    set({ isLoading: true, error: null });
    try {
      await transfersController.sendTransferOtp();
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send OTP";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  initializeTransfer: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await transfersController.initializeTransfer(data);
      await get().fetchTransfers();
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initialize transfer";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  setSelectedTransfer: (transfer) => {
    set({ selectedTransfer: transfer });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      transfers: [],
      selectedTransfer: null,
      isLoading: false,
      error: null,
      pagination: {
        page: 1,
        size: 10,
        total: 0,
      },
    });
  },
}));

