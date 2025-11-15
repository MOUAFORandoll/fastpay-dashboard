import { create } from "zustand";
import { groupedPaymentsController } from "@/controllers/grouped-payments.controller";
import type {
  NewCreateGroupedPaymentDto,
  GroupedPaymentResponseDto,
  FilterDto,
} from "@/types/api";

interface GroupedPayment {
  id: string;
  reference?: string;
  reason?: string;
  launch_url?: string;
  currency?: string;
  when_created?: string;
  createdAt?: string;
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

interface GroupedPaymentsState {
  groupedPayments: GroupedPayment[];
  selectedGroupedPayment: GroupedPayment | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
  fetchGroupedPayments: (params?: { 
    page?: number; 
    size?: number;
    dateFrom?: number;
    dateTo?: number;
  }) => Promise<void>;
  fetchGroupedPaymentByRef: (reference: string) => Promise<void>;
  createGroupedPayment: (data: NewCreateGroupedPaymentDto) => Promise<{
    currency: string;
    when_created: string;
    launch_url: string;
    reference: string;
    reason?: string;
  }>;
  deleteGroupedPayment: (id: string) => Promise<void>;
  setSelectedGroupedPayment: (payment: GroupedPayment | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useGroupedPaymentsStore = create<GroupedPaymentsState>((set, get) => ({
  groupedPayments: [],
  selectedGroupedPayment: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    size: 10,
    total: 0,
  },

  fetchGroupedPayments: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupedPaymentsController.getAllGroupedPayments(params);
      let data: GroupedPayment[] = [];
      let total = 0;
      let page = params?.page || 1;
      let size = params?.size || 10;

      if (response && typeof response === "object") {
        // Check for paginated structure: { grouped_payments: { content: [...], page, size, total } }
        const groupedPayments = (response as { grouped_payments?: { content?: GroupedPayment[]; page?: number; size?: number; total?: number } })?.grouped_payments;
        if (groupedPayments) {
          data = Array.isArray(groupedPayments.content) ? groupedPayments.content : [];
          total = groupedPayments.total || 0;
          page = groupedPayments.page || page;
          size = groupedPayments.size || size;
        } else {
          // Fallback to camelCase for backward compatibility
          const groupedPaymentsCamel = (response as { groupedPayments?: { content?: GroupedPayment[]; page?: number; size?: number; total?: number } })?.groupedPayments;
          if (groupedPaymentsCamel) {
            data = Array.isArray(groupedPaymentsCamel.content) ? groupedPaymentsCamel.content : [];
            total = groupedPaymentsCamel.total || 0;
            page = groupedPaymentsCamel.page || page;
            size = groupedPaymentsCamel.size || size;
          } else if (Array.isArray(response)) {
            data = response;
            total = data.length;
          } else if ((response as { data?: GroupedPayment[] })?.data) {
            data = (response as { data?: GroupedPayment[] })?.data || [];
            total = data.length;
          }
        }
      } else if (Array.isArray(response)) {
        data = response;
        total = data.length;
      }

      set({
        groupedPayments: data,
        isLoading: false,
        pagination: {
          page,
          size,
          total,
        },
      });
    } catch (error) {
      set({ groupedPayments: [], isLoading: false, error: null });
    }
  },

  fetchGroupedPaymentByRef: async (reference) => {
    set({ isLoading: true, error: null });
    try {
      const payment = await groupedPaymentsController.getGroupedPaymentByRef(reference);
      set({
        selectedGroupedPayment: payment as GroupedPayment,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch grouped payment";
      set({ isLoading: false, error: errorMessage });
    }
  },

  createGroupedPayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await groupedPaymentsController.createGroupedPayment(data);
      
      // Parse the response to extract grouped_payment data
      interface GroupedPaymentResponse {
        currency: string;
        when_created: string;
        launch_url: string;
        reference: string;
        reason?: string;
      }

      let paymentData: GroupedPaymentResponse | null = null;

      if (response && typeof response === "object") {
        const groupedPayment = (response as { grouped_payment?: GroupedPaymentResponse })?.grouped_payment;
        if (groupedPayment) {
          paymentData = {
            currency: groupedPayment.currency,
            when_created: groupedPayment.when_created,
            launch_url: groupedPayment.launch_url,
            reference: groupedPayment.reference,
            reason: groupedPayment.reason,
          };
        }
      }

      await get().fetchGroupedPayments();
      set({ isLoading: false });
      
      if (!paymentData) {
        throw new Error("Invalid response from server");
      }
      
      return paymentData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create grouped payment";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteGroupedPayment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await groupedPaymentsController.deleteGroupedPayment(id);
      set({
        groupedPayments: get().groupedPayments.filter((p) => p.id !== id),
        isLoading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete grouped payment";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  setSelectedGroupedPayment: (payment) => {
    set({ selectedGroupedPayment: payment });
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      groupedPayments: [],
      selectedGroupedPayment: null,
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