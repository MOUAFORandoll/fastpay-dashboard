import { create } from "zustand";
import { persist } from "zustand/middleware";
import { organisationsController } from "@/controllers/organisations.controller";
import { apiKeysController } from "@/controllers/api-keys.controller";
import type {
  CreateOrganisationDto,
  UpdateOrganisationDto,
  GenerateApiKeyOrganisationDto,
  CreateWebhookDto,
  UpdateWebhookDto,
} from "@/types/api";

interface Organisation {
  id: string;
  libelle: string;
  web_site?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  apiKeys?: unknown[];
  [key: string]: unknown;
}

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

interface OrganisationsState {
  organisations: Organisation[];
  organisation: Organisation | null;
  currentOrganisationId: string | null;
  apiKeys: ApiKey[];
  webhooks: Webhook[];
  isLoading: boolean;
  error: string | null;
  fetchMyOrganisations: () => Promise<void>;
  fetchMyOrganisation: () => Promise<void>; // Keep for backward compatibility
  createOrganisation: (data: CreateOrganisationDto) => Promise<void>;
  updateOrganisation: (id: string, data: UpdateOrganisationDto) => Promise<void>;
  deleteOrganisation: (id: string) => Promise<void>;
  generateApiKey: (
    organisation: string,
    data: GenerateApiKeyOrganisationDto
  ) => Promise<unknown>;
  fetchApiKeys: (organisation: string) => Promise<void>;
  createWebhook: (
    apiKeyId: string,
    data: CreateWebhookDto
  ) => Promise<void>;
  fetchWebhooks: (apiKeyId: string) => Promise<void>;
  updateWebhook: (
    apiKeyId: string,
    webhookId: string,
    data: UpdateWebhookDto
  ) => Promise<void>;
  deleteWebhook: (apiKeyId: string, webhookId: string) => Promise<void>;
  regenerateApiKeySecret: (apiKeyId: string) => Promise<unknown>;
  deleteApiKey: (apiKeyId: string) => Promise<void>;
  setCurrentOrganisationId: (id: string | null) => void;
  getCurrentOrganisation: () => Organisation | null;
  hasOrganisation: () => boolean;
  clearError: () => void;
}

export const useOrganisationsStore = create<OrganisationsState>()(
  persist(
    (set, get) => ({
      organisations: [],
      organisation: null,
      currentOrganisationId: null,
      apiKeys: [],
      webhooks: [],
      isLoading: false,
      error: null,

      fetchMyOrganisations: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await organisationsController.getMyOrganisation();
          
          // Handle different response structures
          let orgs: Organisation[] = [];
          
          // Check if response has organisations array
          if (
            response &&
            typeof response === "object" &&
            "organisations" in response &&
            Array.isArray((response as { organisations: unknown[] }).organisations)
          ) {
            orgs = (response as { organisations: Organisation[] }).organisations;
          }
          // Check if response is directly an array
          else if (Array.isArray(response)) {
            orgs = response as Organisation[];
          }
          // Check if response is a single organisation object
          else if (response && typeof response === "object" && "id" in response) {
            orgs = [response as Organisation];
          }
          
          // Get current organisation ID from state or localStorage
          const currentId = get().currentOrganisationId || 
            (typeof window !== "undefined" ? localStorage.getItem("current_organisation_id") : null);
          
          // Find current organisation from the list, or use first one if no current ID
          const currentOrg = currentId 
            ? orgs.find(org => org.id === currentId) || orgs[0] || null
            : orgs[0] || null;
          
          // Update current organisation ID if we have organisations but no current ID
          const finalCurrentId = currentOrg?.id || (orgs.length > 0 ? orgs[0].id : null);
          
          set({
            organisations: orgs,
            organisation: currentOrg,
            currentOrganisationId: finalCurrentId,
            isLoading: false,
          });
          
          // Update localStorage
          if (finalCurrentId && typeof window !== "undefined") {
            localStorage.setItem("current_organisation_id", finalCurrentId);
          }
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch organisations";
          set({ isLoading: false, error: errorMessage });
        }
      },

      // Keep for backward compatibility
      fetchMyOrganisation: async () => {
        await get().fetchMyOrganisations();
      },

      createOrganisation: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await organisationsController.createOrganisation(data);
          await get().fetchMyOrganisations();
          set({ isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to create organisation";
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

    updateOrganisation: async (id, data) => {
      set({ isLoading: true, error: null });
      try {
        await organisationsController.updateOrganisation(id, data);
        await get().fetchMyOrganisations();
        set({ isLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to update organisation";
        set({ isLoading: false, error: errorMessage });
        throw error;
      }
    },

    deleteOrganisation: async (id) => {
      set({ isLoading: true, error: null });
      try {
        await organisationsController.deleteOrganisation(id);
        const state = get();
        const updatedOrgs = state.organisations.filter(org => org.id !== id);
        const newCurrentOrg = updatedOrgs.length > 0 ? updatedOrgs[0] : null;
        set({ 
          organisations: updatedOrgs,
          organisation: newCurrentOrg,
          currentOrganisationId: newCurrentOrg?.id || null,
          isLoading: false 
        });
        if (newCurrentOrg?.id && typeof window !== "undefined") {
          localStorage.setItem("current_organisation_id", newCurrentOrg.id);
        } else if (typeof window !== "undefined") {
          localStorage.removeItem("current_organisation_id");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to delete organisation";
        set({ isLoading: false, error: errorMessage });
        throw error;
      }
    },

    generateApiKey: async (organisation, data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiKeysController.generateApiKey(organisation, data);
        await get().fetchApiKeys(organisation);
        set({ isLoading: false });
        return response;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to generate API key";
        set({ isLoading: false, error: errorMessage });
        throw error;
      }
    },

    fetchApiKeys: async (organisation) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiKeysController.listApiKeys(organisation);
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
      }
    },

    createWebhook: async (apiKeyId, data) => {
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

    fetchWebhooks: async (apiKeyId) => {
      set({ isLoading: true, error: null });
      try {
        const response = await apiKeysController.getWebhooks(apiKeyId);
        const hooks = Array.isArray(response)
          ? response
          : (response as { data?: Webhook[]; webhooks?: Webhook[] })?.data ||
            (response as { data?: Webhook[]; webhooks?: Webhook[] })
              ?.webhooks ||
            [];
        set({ webhooks: hooks, isLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch webhooks";
        set({ isLoading: false, error: errorMessage });
      }
    },

    updateWebhook: async (apiKeyId, webhookId, data) => {
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

    deleteWebhook: async (apiKeyId, webhookId) => {
      set({ isLoading: true, error: null });
      try {
        await apiKeysController.deleteWebhook(apiKeyId, webhookId);
        set({
          webhooks: get().webhooks.filter((w) => w.id !== webhookId),
          isLoading: false,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete webhook";
        set({ isLoading: false, error: errorMessage });
        throw error;
      }
    },

    regenerateApiKeySecret: async (apiKeyId) => {
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

    deleteApiKey: async (apiKeyId) => {
      set({ isLoading: true, error: null });
      try {
        await apiKeysController.deleteApiKey(apiKeyId);
        const state = get();
        const updatedKeys = state.apiKeys.filter((key) => key.id !== apiKeyId);
        set({ apiKeys: updatedKeys, isLoading: false });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete API key";
        set({ isLoading: false, error: errorMessage });
        throw error;
      }
    },

    setCurrentOrganisationId: (id: string | null) => {
      const state = get();
      const selectedOrg = id ? state.organisations.find(org => org.id === id) : null;
      set({ 
        currentOrganisationId: id,
        organisation: selectedOrg || null
      });
      if (typeof window !== "undefined") {
        if (id) {
          localStorage.setItem("current_organisation_id", id);
        } else {
          localStorage.removeItem("current_organisation_id");
        }
      }
    },

    getCurrentOrganisation: () => {
      const state = get();
      if (state.organisation) {
        return state.organisation;
      }
      if (state.currentOrganisationId) {
        return state.organisations.find(org => org.id === state.currentOrganisationId) || null;
      }
      return state.organisations.length > 0 ? state.organisations[0] : null;
    },

    hasOrganisation: () => {
      const state = get();
      return state.organisations.length > 0 || !!state.organisation?.id || !!state.currentOrganisationId;
    },

    clearError: () => {
      set({ error: null });
    },
    }),
    {
      name: "organisations-storage",
      partialize: (state) => ({
        currentOrganisationId: state.currentOrganisationId,
        organisation: state.organisation,
        organisations: state.organisations,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore current organisation ID from localStorage on rehydration
        if (state && typeof window !== "undefined") {
          const storedId = localStorage.getItem("current_organisation_id");
          if (storedId && !state.currentOrganisationId) {
            state.setCurrentOrganisationId(storedId);
          }
        }
      },
    }
  )
);

