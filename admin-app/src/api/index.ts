const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

let apiKey: string | null = null;

export const setApiKey = (key: string | null) => {
  apiKey = key;
};

const getHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  ...(apiKey ? { "x-api-key": apiKey } : {}),
});

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || "Request failed",
      };
    }

    return data;
  } catch {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

// Website APIs
export const websiteApi = {
  register: (name: string, canvaDesignId?: string) =>
    fetchApi<{ id: string; apiKey: string }>("/websites", {
      method: "POST",
      body: JSON.stringify({ name, canvaDesignId }),
    }),

  get: (websiteId: string) =>
    fetchApi<{ id: string; name: string }>(`/websites/${websiteId}`),

  update: (websiteId: string, data: { name?: string }) =>
    fetchApi(`/websites/${websiteId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Guest APIs
export interface Guest {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  inviteCode: string;
  hasRsvp: boolean;
  rsvpStatus?: string;
  createdAt: string;
}

export const guestApi = {
  getAll: (websiteId: string) =>
    fetchApi<Guest[]>(`/guests/website/${websiteId}`),

  add: (websiteId: string, guests: Array<{ name: string; email?: string; phone?: string }>) =>
    fetchApi<Guest[]>("/guests", {
      method: "POST",
      body: JSON.stringify({ websiteId, guests }),
    }),

  delete: (guestId: string) =>
    fetchApi(`/guests/${guestId}`, {
      method: "DELETE",
    }),

  regenerateCode: (guestId: string) =>
    fetchApi<{ inviteCode: string }>(`/guests/${guestId}/regenerate-code`, {
      method: "POST",
    }),
};

// RSVP APIs
export interface RSVP {
  _id: string;
  guestId: string;
  guestName: string;
  status: "attending" | "not_attending" | "maybe";
  numberOfGuests: number;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

export const rsvpApi = {
  getAll: (websiteId: string) =>
    fetchApi<RSVP[]>(`/rsvp/website/${websiteId}`),

  getStats: (websiteId: string) =>
    fetchApi<{
      attending: number;
      notAttending: number;
      maybe: number;
      pending: number;
      totalGuests: number;
    }>(`/rsvp/website/${websiteId}/stats`),
};

// Wish APIs
export interface Wish {
  _id: string;
  guestId: string;
  guestName: string;
  message: string;
  isHidden: boolean;
  reportCount: number;
  createdAt: string;
}

export const wishApi = {
  getAll: (websiteId: string) =>
    fetchApi<Wish[]>(`/wishes/website/${websiteId}/all`),

  hide: (wishId: string) =>
    fetchApi(`/wishes/${wishId}/hide`, {
      method: "PUT",
    }),

  unhide: (wishId: string) =>
    fetchApi(`/wishes/${wishId}/unhide`, {
      method: "PUT",
    }),

  delete: (wishId: string) =>
    fetchApi(`/wishes/${wishId}`, {
      method: "DELETE",
    }),
};
