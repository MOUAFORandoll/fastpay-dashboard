import { create } from "zustand";
import { paymentsController } from "@/controllers/payments.controller";
import type {
  NewCreatePaymentDto,
  NewCreateDirectPaymentDto,
  FilterDto,
} from "@/types/api";

interface Payment {
  id: string;
  reference?: string;
  amount: number;
  description?: string;
  status: string;
  transaction_type?: string;
  createdAt?: string;
  launch_url?: string;
  organisation?: {
    id: string;
    libelle?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
    apiKeys?: unknown[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface PaymentsState {
  payments: Payment[];
  selectedPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
  filters: FilterDto | null;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  fetchPayments: (params?: { page?: number; size?: number }) => Promise<void>;
  fetchPaymentById: (id: string) => Promise<void>;
  fetchPaymentByRef: (reference: string) => Promise<void>;
  filterPayments: (
    filters: FilterDto,
    params?: { page?: number; size?: number }
  ) => Promise<void>;
  createPayment: (data: NewCreatePaymentDto) => Promise<void>;
  createDirectPayment: (data: NewCreateDirectPaymentDto) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  startExecution: (id: string) => Promise<void>;
  completeTransaction: (id: string) => Promise<void>;
  failTransaction: (id: string) => Promise<void>;
  setSelectedPayment: (payment: Payment | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const usePaymentsStore = create<PaymentsState>((set, get) => ({
  payments: [],
  selectedPayment: null,
  isLoading: false,
  error: null,
  filters: null,
  pagination: {
    page: 1,
    size: 10,
    total: 0,
  },

  fetchPayments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await paymentsController.getAllPayments(params);
      // API response structure: { payments: { content: Payment[], page: number, size: number, total: number } }
      let data: Payment[] = [];
      let total = 0;
      let page = params?.page || 1;
      let size = params?.size || 10;

      if (response && typeof response === "object") {
        // Check for new structure: { payments: { content: [...], page, size, total } }
        const payments = (response as { payments?: { content?: Payment[]; page?: number; size?: number; total?: number } })?.payments;
        if (payments) {
          data = Array.isArray(payments.content) ? payments.content : [];
          total = payments.total || 0;
          page = payments.page || page;
          size = payments.size || size;
        } else {
          // Fallback to old structure: { paiements: { content: [...], page, size, total } }
          const paiements = (response as { paiements?: { content?: Payment[]; page?: number; size?: number; total?: number } })?.paiements;
          if (paiements) {
            data = Array.isArray(paiements.content) ? paiements.content : [];
            total = paiements.total || 0;
            page = paiements.page || page;
            size = paiements.size || size;
          } else if (Array.isArray(response)) {
            // Fallback: if response is directly an array
            data = response;
            total = data.length;
          } else if ((response as { data?: Payment[] })?.data) {
            // Fallback: check for data property
            data = (response as { data?: Payment[] })?.data || [];
            total = data.length;
          }
        }
      } else if (Array.isArray(response)) {
        data = response;
        total = data.length;
      }

      set({
        payments: data,
        isLoading: false,
        pagination: {
          page,
          size,
          total,
        },
      });
    } catch (error) {
      // Error is already handled by API base (toast shown, logged to console)
      // Set payments to empty array on error
      set({ payments: [], isLoading: false, error: null });
    }
  },

  fetchPaymentById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await paymentsController.getPaymentById(id);
      set({
        selectedPayment: payment as Payment,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payment";
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchPaymentByRef: async (reference) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await paymentsController.getPaymentByRef(reference);
      set({
        selectedPayment: payment as Payment,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payment";
      set({ isLoading: false, error: errorMessage });
    }
  },

  filterPayments: async (filters, params) => {
    set({ isLoading: true, error: null, filters });
    try {
      const response = await paymentsController.filterPayments(filters, params);
      // API response structure: { payments: { content: Payment[], page: number, size: number, total: number } }
      let data: Payment[] = [];
      let total = 0;
      let page = params?.page || 1;
      let size = params?.size || 10;

      if (response && typeof response === "object") {
        // Check for new structure: { payments: { content: [...], page, size, total } }
        const payments = (response as { payments?: { content?: Payment[]; page?: number; size?: number; total?: number } })?.payments;
        if (payments) {
          data = Array.isArray(payments.content) ? payments.content : [];
          total = payments.total || 0;
          page = payments.page || page;
          size = payments.size || size;
        } else {
          // Fallback to old structure: { paiements: { content: [...], page, size, total } }
          const paiements = (response as { paiements?: { content?: Payment[]; page?: number; size?: number; total?: number } })?.paiements;
          if (paiements) {
            data = Array.isArray(paiements.content) ? paiements.content : [];
            total = paiements.total || 0;
            page = paiements.page || page;
            size = paiements.size || size;
          } else if (Array.isArray(response)) {
            data = response;
            total = data.length;
          } else if ((response as { data?: Payment[] })?.data) {
            data = (response as { data?: Payment[] })?.data || [];
            total = data.length;
          }
        }
      } else if (Array.isArray(response)) {
        data = response;
        total = data.length;
      }

      set({
        payments: data,
        isLoading: false,
        pagination: {
          page,
          size,
          total,
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to filter payments";
      set({ isLoading: false, error: errorMessage });
    }
  },

  createPayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await paymentsController.createPayment(data);
      await get().fetchPayments();
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create payment";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  createDirectPayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await paymentsController.createDirectPayment(data);
      await get().fetchPayments();
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create direct payment";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deletePayment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await paymentsController.deletePayment(id);
      set({
        payments: get().payments.filter((p) => p.id !== id),
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete payment";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  startExecution: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await paymentsController.startExecution(id);
      await get().fetchPaymentById(id);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to start execution";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  completeTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await paymentsController.completeTransaction(id);
      await get().fetchPaymentById(id);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to complete transaction";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  failTransaction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await paymentsController.failTransaction(id);
      await get().fetchPaymentById(id);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fail transaction";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  setSelectedPayment: (payment) => {
    set({ selectedPayment: payment });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      payments: [],
      selectedPayment: null,
      isLoading: false,
      error: null,
      filters: null,
      pagination: {
        page: 1,
        size: 10,
        total: 0,
      },
    });
  },
}));

