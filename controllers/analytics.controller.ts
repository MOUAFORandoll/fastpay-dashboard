import { apiGet } from "@/lib/api/base";
import { getCurrentOrganisationId } from "@/lib/api/config";
import type {
  AnalyticsOverviewResponseDto,
  AnalyticsGraphDataResponseDto,
  AnalyticsTopBeneficiariesResponseDto,
} from "@/types/api";

export const analyticsController = {
  getOverview: async (params?: {
    organisation_id?: string;
  }): Promise<AnalyticsOverviewResponseDto> => {
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
    return apiGet<AnalyticsOverviewResponseDto>(
      "/analytics/overview",
      Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
  },

  getGraphData: async (params?: {
    organisation_id?: string;
  }): Promise<AnalyticsGraphDataResponseDto> => {
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
    return apiGet<AnalyticsGraphDataResponseDto>(
      "/analytics/graph",
      Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
  },

  getTopBeneficiaries: async (params?: {
    organisation_id?: string;
  }): Promise<AnalyticsTopBeneficiariesResponseDto> => {
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
    return apiGet<AnalyticsTopBeneficiariesResponseDto>(
      "/analytics/top-beneficiaries",
      Object.keys(queryParams).length > 0 ? queryParams : undefined
    );
  },
};

