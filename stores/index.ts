// Export all stores for easier imports
export { useAuthStore } from "./auth.store";
export { usePaymentsStore } from "./payments.store";
export { useOrganisationsStore } from "./organisations.store";
export { useBeneficiariesStore } from "./beneficiaries.store";
export { useAnalyticsStore } from "./analytics.store";
export { useCountriesStore } from "./countries.store";
export { useMobileServicesStore } from "./mobile-services.store";
export { useTransfersStore } from "./transfers.store";

// Import stores to access reset methods
import { usePaymentsStore } from "./payments.store";
import { useTransfersStore } from "./transfers.store";
import { useBeneficiariesStore } from "./beneficiaries.store";
import { useAnalyticsStore } from "./analytics.store";

/**
 * Resets all organization-specific stores to clear old context
 * when switching organizations. This ensures no stale data remains
 * from the previous organization.
 */
export const resetOrganizationStores = () => {
  const paymentsStore = usePaymentsStore.getState();
  const transfersStore = useTransfersStore.getState();
  const beneficiariesStore = useBeneficiariesStore.getState();
  const analyticsStore = useAnalyticsStore.getState();

  // Reset all organization-specific stores
  paymentsStore.reset();
  transfersStore.reset();
  beneficiariesStore.reset();
  analyticsStore.reset();
};

