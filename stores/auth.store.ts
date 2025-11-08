import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authController } from "@/controllers/auth.controller";
import { setAuthToken, removeAuthToken } from "@/lib/api/config";
import type {
  LoginRequestDto,
  LoginResponseDto,
  UserDto,
} from "@/types/api";

export type UserRole = "ADMIN" | "MERCHANT" | "CLIENT";

/**
 * Get the route for a user role
 */
export const getRoleRoute = (role: UserRole): string => {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MERCHANT":
      return "/merchant";
    case "CLIENT":
    default:
      return "/dashboard";
  }
};

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  error: string | null;
  login: (data: LoginRequestDto) => Promise<void>;
  register: (data: {
    fullname: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserDto | null) => void;
  clearError: () => void;
  getRole: () => UserRole | null;
  getRoleRoute: () => string;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isHydrated: false,
      error: null,

      login: async (data: LoginRequestDto) => {
        set({ isLoading: true, error: null });
        try {
          const response: LoginResponseDto = await authController.login(data);
          setAuthToken(response.auth_token);
          set({
            user: response.user,
            token: response.auth_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Error is already handled by API base (toast shown, logged to console)
          set({
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response: LoginResponseDto = await authController.register(data);
          setAuthToken(response.auth_token);
          set({
            user: response.user,
            token: response.auth_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Error is already handled by API base (toast shown, logged to console)
          set({
            isLoading: false,
            error: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authController.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          removeAuthToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      setUser: (user: UserDto | null) => {
        set({ user, isAuthenticated: !!user });
      },

      clearError: () => {
        set({ error: null });
      },

      getRole: (): UserRole | null => {
        const state = get();
        return state.user?.role as UserRole | null;
      },

      getRoleRoute: (): string => {
        const state = get();
        const role = state.user?.role as UserRole | null;
        if (!role) return "/";
        return getRoleRoute(role);
      },

      setHydrated: (hydrated: boolean) => {
        set({ isHydrated: hydrated });
        // When hydrated, restore token to API config if available
        if (hydrated && typeof window !== "undefined") {
          const state = get();
          if (state.token) {
            setAuthToken(state.token);
          }
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated after rehydration
        if (state) {
          state.setHydrated(true);
          // Restore token to API config
          if (state.token && typeof window !== "undefined") {
            setAuthToken(state.token);
          }
        }
      },
    }
  )
);

