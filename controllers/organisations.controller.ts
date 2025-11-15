import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/base";
import type {
  CreateOrganisationDto,
  UpdateOrganisationDto,
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

  updateOrganisation: async (
    id: string,
    data: UpdateOrganisationDto
  ): Promise<{ message: string }> => {
    return apiPatch(`/organisations/${id}`, data);
  },

  deleteOrganisation: async (id: string): Promise<{ message: string }> => {
    return apiDelete(`/organisations/${id}`);
  },
};

