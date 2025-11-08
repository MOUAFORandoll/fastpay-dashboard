import { API_BASE_URL, getAuthHeaders, getAuthToken } from "./config";
import type { IAppErrorDto } from "@/types/api";

export class ApiError extends Error {
  constructor(
    public status: number,
    public error: IAppErrorDto["error"],
    message?: string
  ) {
    super(message || error.message);
    this.name = "ApiError";
  }
}

/**
 * Show error toast notification
 * Only works on client-side
 */
const showErrorToast = (error: IAppErrorDto["error"]): void => {
  if (typeof window === "undefined") return;

  try {
    // Dynamically import sonner to avoid SSR issues
    const { toast } = require("sonner");
    
    // Get the error message - prefer display_messages if available
    let errorMessage = error.message;
    
    if (error.display_messages && error.display_messages.length > 0) {
      // Use the first display message (could be enhanced to use locale)
      errorMessage = error.display_messages[0].value;
    }

    // Show appropriate toast based on status code
    const statusCode = error.status_code;
    if (statusCode === 401) {
      toast.error("Authentication required", {
        description: errorMessage,
      });
    } else if (statusCode === 403) {
      toast.error("Access denied", {
        description: errorMessage,
      });
    } else if (statusCode === 404) {
      toast.error("Not found", {
        description: errorMessage,
      });
    } else if (statusCode && statusCode >= 500) {
      toast.error("Server error", {
        description: errorMessage || "An error occurred on the server",
      });
    } else {
      toast.error(errorMessage || "An error occurred");
    }
  } catch {
    // If sonner is not available, just log to console
    console.error("API Error:", error);
  }
};

/**
 * Get the current auth token from the auth store (auth context)
 * This ensures the token is always fresh from the auth context/store
 * Falls back to localStorage if store is not available (SSR scenarios)
 */
const getTokenFromAuthStore = (): string | null => {
  // Server-side: return null (no token available)
  if (typeof window === "undefined") return null;
  
  try {
    // Client-side: get token from auth store
    // Using dynamic import to avoid SSR issues with Zustand
    const authStoreModule = require("@/stores/auth.store");
    const state = authStoreModule.useAuthStore.getState();
    return state.token;
  } catch (error) {
    // Fallback to localStorage if store is not available or not initialized
    console.warn("Auth store not available, falling back to localStorage:", error);
    return getAuthToken();
  }
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from auth store (auth context)
  const token = getTokenFromAuthStore();
  
  // Build headers with token from auth store
  const headers = {
    ...getAuthHeaders(token),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData: IAppErrorDto["error"] | null = null;
    try {
      const errorResponse = await response.json();
      if (errorResponse.error) {
        errorData = errorResponse.error;
      }
    } catch {
      // If JSON parsing fails, create a generic error
      errorData = {
        code: "UNKNOWN_ERROR",
        message: response.statusText || "An unknown error occurred",
        status_code: response.status,
      };
    }

    const finalError = errorData || {
      code: "UNKNOWN_ERROR",
      message: response.statusText || "An unknown error occurred",
      status_code: response.status,
    };

    // Show toast notification for the error
    showErrorToast(finalError);

    // Create and throw the error (callers can still catch if needed)
    // But the toast will have already been shown
    throw new ApiError(response.status, finalError);
  }

  // Handle empty responses
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return {} as T;
  }

  return response.json();
};

export const apiGet = <T>(endpoint: string, params?: Record<string, unknown>): Promise<T> => {
  const queryString = params
    ? `?${new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString()}`
    : "";
  return apiRequest<T>(`${endpoint}${queryString}`, { method: "GET" });
};

export const apiPost = <T>(endpoint: string, data?: unknown): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiPatch = <T>(endpoint: string, data?: unknown): Promise<T> => {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
};

export const apiDelete = <T>(endpoint: string): Promise<T> => {
  return apiRequest<T>(endpoint, { method: "DELETE" });
};

