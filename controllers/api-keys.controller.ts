import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/base";
import type {
  GenerateApiKeyOrganisationDto,
  CreateWebhookDto,
  UpdateWebhookDto,
} from "@/types/api";

export const apiKeysController = {
  generateApiKey: async (
    organisation: string,
    data: GenerateApiKeyOrganisationDto
  ): Promise<unknown> => {
    return apiPost(`/api-keys/${organisation}/generate`, data);
  },

  listApiKeys: async (organisation: string): Promise<unknown> => {
    return apiGet(`/api-keys/${organisation}/api-key`);
  },

  createWebhook: async (
    apiKeyId: string,
    data: CreateWebhookDto
  ): Promise<{ message: string }> => {
    return apiPost(`/api-keys/${apiKeyId}/webhooks`, data);
  },

  getWebhooks: async (apiKeyId: string): Promise<unknown> => {
    return apiGet(`/api-keys/${apiKeyId}/webhooks`);
  },

  updateWebhook: async (
    apiKeyId: string,
    webhookId: string,
    data: UpdateWebhookDto
  ): Promise<{ message: string }> => {
    return apiPatch(`/api-keys/${apiKeyId}/webhooks/${webhookId}`, data);
  },

  deleteWebhook: async (
    apiKeyId: string,
    webhookId: string
  ): Promise<{ message: string }> => {
    return apiDelete(`/api-keys/${apiKeyId}/webhooks/${webhookId}`);
  },

  regenerateApiKeySecret: async (apiKeyId: string): Promise<unknown> => {
    return apiGet(`/api-keys/${apiKeyId}/regenerate`);
  },

  deleteApiKey: async (apiKeyId: string): Promise<{ message: string }> => {
    return apiDelete(`/api-keys/${apiKeyId}`);
  },
};

