import { create } from "zustand";
import { transfersController } from "@/controllers/transfers.controller";
import type { CreateTransfertDto } from "@/types/api";

interface Transfer {
  id: string;
  amount: number;
  name: string;
  phone: string;
  service_mobile_code: string;
  status?: string;
  createdAt?: string;
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
      // Ensure we always get an array
      let data: Transfer[] = [];
      if (Array.isArray(response)) {
        data = response;
      } else if (response && typeof response === "object") {
        data = (response as { data?: Transfer[]; transfers?: Transfer[] })?.data ||
               (response as { data?: Transfer[]; transfers?: Transfer[] })?.transfers ||
               [];
      }
      set({
        transfers: data,
        isLoading: false,
        pagination: {
          page: params?.page || 1,
          size: params?.size || 10,
          total: (response as { total?: number })?.total || data.length,
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

