import { create } from "zustand";
import { apiKeysController } from "@/controllers/api-keys.controller";
import type {
  GenerateApiKeyOrganisationDto,
  CreateWebhookDto,
  UpdateWebhookDto,
} from "@/types/api";

interface ApiKey {
  id: string;
  title: string;
  description?: string;
  key?: string;
  secret?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface Webhook {
  id: string;
  link: string;
  title?: string;
  createdAt?: string;
  [key: string]: unknown;
}

interface SettingsState {
  apiKeys: ApiKey[];
  webhooks: Record<string, Webhook[]>; // apiKeyId -> webhooks[]
  isLoading: boolean;
  error: string | null;
  fetchApiKeys: (organisationId: string) => Promise<void>;
  generateApiKey: (
    organisationId: string,
    data: GenerateApiKeyOrganisationDto
  ) => Promise<unknown>;
  regenerateApiKeySecret: (apiKeyId: string) => Promise<unknown>;
  deleteApiKey: (apiKeyId: string) => Promise<void>;
  fetchWebhooks: (apiKeyId: string) => Promise<void>;
  createWebhook: (apiKeyId: string, data: CreateWebhookDto) => Promise<void>;
  updateWebhook: (
    apiKeyId: string,
    webhookId: string,
    data: UpdateWebhookDto
  ) => Promise<void>;
  deleteWebhook: (apiKeyId: string, webhookId: string) => Promise<void>;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKeys: [],
  webhooks: {},
  isLoading: false,
  error: null,

  fetchApiKeys: async (organisationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeysController.listApiKeys(organisationId);
      const keys = Array.isArray(response)
        ? response
        : (response as { data?: ApiKey[]; keys?: ApiKey[] })?.data ||
          (response as { data?: ApiKey[]; keys?: ApiKey[] })?.keys ||
          [];
      set({ apiKeys: keys, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch API keys";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  generateApiKey: async (organisationId: string, data: GenerateApiKeyOrganisationDto) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeysController.generateApiKey(organisationId, data);
      await get().fetchApiKeys(organisationId);
      set({ isLoading: false });
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate API key";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  regenerateApiKeySecret: async (apiKeyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeysController.regenerateApiKeySecret(apiKeyId);
      set({ isLoading: false });
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to regenerate secret key";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteApiKey: async (apiKeyId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiKeysController.deleteApiKey(apiKeyId);
      const state = get();
      const updatedKeys = state.apiKeys.filter((key) => key.id !== apiKeyId);
      const updatedWebhooks = { ...state.webhooks };
      delete updatedWebhooks[apiKeyId];
      set({ apiKeys: updatedKeys, webhooks: updatedWebhooks, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete API key";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  fetchWebhooks: async (apiKeyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiKeysController.getWebhooks(apiKeyId);
      const hooks = Array.isArray(response)
        ? response
        : (response as { data?: Webhook[]; webhooks?: Webhook[] })?.data ||
          (response as { data?: Webhook[]; webhooks?: Webhook[] })
            ?.webhooks ||
          [];
      set((state) => ({
        webhooks: {
          ...state.webhooks,
          [apiKeyId]: hooks,
        },
        isLoading: false,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch webhooks";
      set({ isLoading: false, error: errorMessage });
    }
  },

  createWebhook: async (apiKeyId: string, data: CreateWebhookDto) => {
    set({ isLoading: true, error: null });
    try {
      await apiKeysController.createWebhook(apiKeyId, data);
      await get().fetchWebhooks(apiKeyId);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create webhook";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  updateWebhook: async (apiKeyId: string, webhookId: string, data: UpdateWebhookDto) => {
    set({ isLoading: true, error: null });
    try {
      await apiKeysController.updateWebhook(apiKeyId, webhookId, data);
      await get().fetchWebhooks(apiKeyId);
      set({ isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update webhook";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteWebhook: async (apiKeyId: string, webhookId: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiKeysController.deleteWebhook(apiKeyId, webhookId);
      const state = get();
      const updatedWebhooks = {
        ...state.webhooks,
        [apiKeyId]: (state.webhooks[apiKeyId] || []).filter(
          (w) => w.id !== webhookId
        ),
      };
      set({ webhooks: updatedWebhooks, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete webhook";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

