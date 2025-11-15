import { apiGet, apiPost, apiDelete } from "@/lib/api/base";
import { getCurrentOrganisationId } from "@/lib/api/config";
import type {
  NewCreateGroupedPaymentDto,
  FilterDto,
} from "@/types/api";

export const groupedPaymentsController = {
  createGroupedPayment: async (
    data: NewCreateGroupedPaymentDto
  ): Promise<unknown> => {
    const organisationId = getCurrentOrganisationId();
    const payload: NewCreateGroupedPaymentDto = {
      ...data,
      organisation_id: data.organisation_id || organisationId || undefined,
    };
    return apiPost("/grouped-payments/new-payment", payload);
  },

  getAllGroupedPayments: async (params?: {
    page?: number;
    size?: number;
    organisation_id?: string;
    dateFrom?: number;
    dateTo?: number;
  }): Promise<unknown> => {
    const organisationId = getCurrentOrganisationId();
    const queryParams: Record<string, unknown> = {};
    
    if (params?.page) queryParams.page = params.page;
    if (params?.size) queryParams.size = params.size;
    if (params?.organisation_id || organisationId) {
      queryParams.organisation_id = params?.organisation_id || organisationId;
    }
    
    // Set default date range if not provided (last 30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    queryParams.dateFrom = params?.dateFrom || thirtyDaysAgo;
    queryParams.dateTo = params?.dateTo || now;
    
    return apiGet("/grouped-payments", queryParams);
  },

  getGroupedPaymentByRef: async (reference: string): Promise<unknown> => {
    return apiGet(`/grouped-payments/by-ref/${reference}`);
  },

  getGroupedPaymentTransactions: async (
    groupedPaymentId: string,
    filters?: FilterDto,
    params?: { page?: number; size?: number }
  ): Promise<unknown> => {
    const queryParams: Record<string, unknown> = {
      grouped_payment_id: groupedPaymentId,
    };
    
    if (params?.page) queryParams.page = params.page;
    if (params?.size) queryParams.size = params.size;
    
    // Set default filter values if not provided
    if (filters) {
      queryParams.transaction_type = filters.transaction_type;
      queryParams.status = filters.status;
      queryParams.dateFrom = filters.dateFrom;
      queryParams.dateTo = filters.dateTo;
    } else {
      // Default to all payment types and all statuses
      queryParams.transaction_type = "PAYMENT";
      queryParams.status = "INIT";
      const now = Date.now();
      const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
      queryParams.dateFrom = thirtyDaysAgo;
      queryParams.dateTo = now;
    }
    
    return apiGet("/grouped-payments/payments", queryParams);
  },

  deleteGroupedPayment: async (id: string): Promise<{ message: string }> => {
    return apiDelete(`/grouped-payments/${id}`);
  },
};

