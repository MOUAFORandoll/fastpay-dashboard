import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/base";
import type {
  CreateOrganisationDto,
  UpdateOrganisationDto,
  GenerateApiKeyOrganisationDto,
  CreateWebhookDto,
  UpdateWebhookDto,
} from "@/types/api";

export const organisationsController = {
  createOrganisation: async (
    data: CreateOrganisationDto
  ): Promise<{ message: string }> => {
    return apiPost("/organisations", data);
  },

  getMyOrganisation: async (): Promise<unknown> => {
    return apiGet("/organisations/me");
  },

  generateApiKey: async (
    organisation: string,
    data: GenerateApiKeyOrganisationDto
  ): Promise<unknown> => {
    return apiPost(`/organisations/${organisation}/api-key`, data);
  },

  listApiKeys: async (organisation: string): Promise<unknown> => {
    return apiGet(`/organisations/${organisation}/api-key`);
  },

  updateOrganisation: async (
    id: string,
    data: UpdateOrganisationDto
  ): Promise<{ message: string }> => {
    return apiPatch(`/organisations/${id}`, data);
  },

  deleteOrganisation: async (id: string): Promise<{ message: string }> => {
    return apiDelete(`/organisations/${id}`);
  },

  createWebhook: async (
    organisation: string,
    data: CreateWebhookDto
  ): Promise<{ message: string }> => {
    return apiPost(`/organisations/${organisation}/webhooks`, data);
  },

  getWebhooks: async (organisation: string): Promise<unknown> => {
    return apiGet(`/organisations/${organisation}/webhooks`);
  },

  updateWebhook: async (
    organisation: string,
    webhookId: string,
    data: UpdateWebhookDto
  ): Promise<{ message: string }> => {
    return apiPatch(
      `/organisations/${organisation}/webhooks/${webhookId}`,
      data
    );
  },

  deleteWebhook: async (
    organisation: string,
    webhookId: string
  ): Promise<{ message: string }> => {
    return apiDelete(
      `/organisations/${organisation}/webhooks/${webhookId}`
    );
  },
};

