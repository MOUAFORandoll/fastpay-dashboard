import { apiGet, apiDelete, apiPost, apiPatch } from "@/lib/api/base";
import type { UserDto, LoginResponseDto } from "@/types/api";

export const usersController = {
  getCurrentUser: async (): Promise<UserDto> => {
    return apiGet<UserDto>("/users/me");
  },

  getUserById: async (id: string): Promise<UserDto> => {
    return apiGet<UserDto>(`/users/${id}`);
  },

  deleteUser: async (id: string): Promise<{ message: string }> => {
    return apiDelete(`/users/${id}`);
  },

  sendNotification: async (): Promise<void> => {
    await apiGet("/users/send-notif");
  },

  updateNotificationToken: async (): Promise<void> => {
    await apiPatch("/users/notification");
  },

  verifyIdentity: async (): Promise<LoginResponseDto> => {
    return apiPost<LoginResponseDto>("/users/verify-identity");
  },
};

