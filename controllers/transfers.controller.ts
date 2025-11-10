import { apiGet, apiPost } from "@/lib/api/base";
import { getCurrentOrganisationId } from "@/lib/api/config";
import type { CreateTransfertDto } from "@/types/api";

export const transfersController = {
  initializeTransfer: async (
    data: CreateTransfertDto & { organisation_id?: string }
  ): Promise<{ message: string }> => {
    const organisationId = getCurrentOrganisationId();
    const payload = {
      ...data,
      organisation_id: data.organisation_id || organisationId || undefined,
    };
    return apiPost("/transferts/initialise", payload);
  },

  getAllTransfers: async (params?: {
    page?: number;
    size?: number;
    organisation_id?: string;
  }): Promise<unknown> => {
    const organisationId = getCurrentOrganisationId();
    const queryParams = {
      ...params,
      organisation_id: params?.organisation_id || organisationId || undefined,
    };
    // Remove undefined values
    Object.keys(queryParams).forEach(
      (key) =>
        queryParams[key as keyof typeof queryParams] === undefined &&
        delete queryParams[key as keyof typeof queryParams]
    );
    return apiGet("/transferts", queryParams);
  },

  getTransferById: async (id: string): Promise<unknown> => {
    return apiGet(`/transferts/${id}`);
  },
};

