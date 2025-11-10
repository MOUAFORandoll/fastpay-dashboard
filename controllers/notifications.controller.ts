import { apiGet } from "@/lib/api/base";

export const notificationsController = {
  sendEvents: async (ref: string): Promise<void> => {
    await apiGet(`/notifications/events/${ref}`);
  },
};

