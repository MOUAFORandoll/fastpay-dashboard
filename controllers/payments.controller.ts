import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/base";
import { getCurrentOrganisationId } from "@/lib/api/config";
import type {
  NewCreatePaymentDto,
  NewCreateDirectPaymentDto,
  FilterDto,
  TransactionStatusResponseDto,
} from "@/types/api";

export const paymentsController = {
  createPayment: async (
    data: NewCreatePaymentDto
  ): Promise<unknown> => {
    const organisationId = getCurrentOrganisationId();
    const payload: NewCreatePaymentDto = {
      ...data,
      organisation_id: data.organisation_id || organisationId || undefined,
    };
    return apiPost("/payments/new-payment", payload);
  },

  createDirectPayment: async (
    data: NewCreateDirectPaymentDto
  ): Promise<{ message: string }> => {
    const organisationId = getCurrentOrganisationId();
    const payload: NewCreateDirectPaymentDto = {
      ...data,
      organisation_id: data.organisation_id || organisationId || undefined,
    };
    return apiPost("/payments/initialize-direct-payment", payload);
  },

  getAllPayments: async (params?: {
    page?: number;
    size?: number;
    organisation_id?: string;
  }): Promise<unknown> => {
    const organisationId = getCurrentOrganisationId();
    const queryParams: Record<string, unknown> = {};
    
    if (params?.page) queryParams.page = params.page;
    if (params?.size) queryParams.size = params.size;
    if (params?.organisation_id || organisationId) {
      queryParams.organisation_id = params?.organisation_id || organisationId;
    }
    
    // Only pass organisation_id, page, and size (per_page)
    // Do not include date fields or filter fields by default
    return apiGet("/payments", queryParams);
  },

  filterPayments: async (
    data: FilterDto,
    params?: { page?: number; size?: number; organisation_id?: string }
  ): Promise<unknown> => {
    const organisationId = getCurrentOrganisationId();
    const queryParamsObj = {
      ...params,
      organisation_id: params?.organisation_id || organisationId || undefined,
    };
    // Remove undefined values
    Object.keys(queryParamsObj).forEach(
      (key) =>
        queryParamsObj[key as keyof typeof queryParamsObj] === undefined &&
        delete queryParamsObj[key as keyof typeof queryParamsObj]
    );
    const queryParams = Object.keys(queryParamsObj).length > 0
      ? `?${new URLSearchParams(
          Object.entries(queryParamsObj).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ).toString()}`
      : "";
    return apiPost(`/payments/filter${queryParams}`, data);
  },

  getPaymentByRef: async (reference: string): Promise<unknown> => {
    return apiGet(`/payments/by-ref/${reference}`);
  },

  getPaymentById: async (id: string): Promise<unknown> => {
    return apiGet(`/payments/${id}`);
  },

  deletePayment: async (id: string): Promise<{ message: string }> => {
    return apiDelete(`/payments/${id}`);
  },

  startExecution: async (
    id: string
  ): Promise<TransactionStatusResponseDto> => {
    return apiPatch<TransactionStatusResponseDto>(
      `/payments/${id}/start-execution`
    );
  },

  completeTransaction: async (
    id: string
  ): Promise<TransactionStatusResponseDto> => {
    return apiPatch<TransactionStatusResponseDto>(
      `/payments/${id}/complete`
    );
  },

  failTransaction: async (
    id: string
  ): Promise<TransactionStatusResponseDto> => {
    return apiPatch<TransactionStatusResponseDto>(`/payments/${id}/fail`);
  },
};

