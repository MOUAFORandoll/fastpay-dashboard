import { create } from "zustand";
import { analyticsController } from "@/controllers/analytics.controller";
import type {
  AnalyticsOverviewResponseDto,
  AnalyticsGraphDataResponseDto,
  AnalyticsTopBeneficiariesResponseDto,
} from "@/types/api";

interface AnalyticsState {
  overview: AnalyticsOverviewResponseDto | null;
  graphData: AnalyticsGraphDataResponseDto | null;
  topBeneficiaries: AnalyticsTopBeneficiariesResponseDto | null;
  isLoading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchGraphData: () => Promise<void>;
  fetchTopBeneficiaries: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  overview: null,
  graphData: null,
  topBeneficiaries: null,
  isLoading: false,
  error: null,

  fetchOverview: async () => {
    set({ isLoading: true, error: null });
    try {
      const overview = await analyticsController.getOverview();
      set({ overview, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch analytics overview";
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchGraphData: async () => {
    set({ isLoading: true, error: null });
    try {
      const graphData = await analyticsController.getGraphData();
      set({ graphData, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch graph data";
      set({ isLoading: false, error: errorMessage });
    }
  },

  fetchTopBeneficiaries: async () => {
    set({ isLoading: true, error: null });
    try {
      const topBeneficiaries =
        await analyticsController.getTopBeneficiaries();
      set({ topBeneficiaries, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch top beneficiaries";
      set({ isLoading: false, error: errorMessage });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      overview: null,
      graphData: null,
      topBeneficiaries: null,
      isLoading: false,
      error: null,
    });
  },
}));

