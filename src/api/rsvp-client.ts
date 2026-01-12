// API client for RSVP and Wishes backend

const API_BASE_URL = process.env.BACKEND_URL || "http://localhost:3001";

export type RSVPStatusType = "attending" | "not_attending" | "maybe";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GuestData {
  id: string;
  name: string;
  hasRsvp: boolean;
  rsvpStatus: string | null;
}

export interface RSVPStats {
  attending: number;
  notAttending: number;
  maybe: number;
  pending: number;
  totalGuests: number;
}

export interface Wish {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;
}

export interface Website {
  id: string;
  name: string;
  exists: boolean;
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
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
  } catch (error) {
    return {
      success: false,
      error: "Network error. Please try again.",
    };
  }
}

export const api = {
  // Website validation
  validateWebsite: (websiteId: string): Promise<ApiResponse<Website>> => {
    return fetchApi<Website>(`/api/websites/${websiteId}/validate`);
  },

  // Guest validation via invite code
  validateInviteCode: (
    websiteId: string,
    inviteCode: string
  ): Promise<ApiResponse<GuestData>> => {
    return fetchApi<GuestData>("/api/guests/validate", {
      method: "POST",
      body: JSON.stringify({ websiteId, inviteCode }),
    });
  },

  // RSVP submission
  submitRSVP: (params: {
    websiteId: string;
    guestId: string;
    status: RSVPStatusType;
    numberOfGuests?: number;
    message?: string;
  }): Promise<ApiResponse<any>> => {
    return fetchApi("/api/rsvp", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  // Get RSVP stats
  getRSVPStats: (websiteId: string): Promise<ApiResponse<RSVPStats>> => {
    return fetchApi<RSVPStats>(`/api/rsvp/website/${websiteId}/stats`);
  },

  // Wish submission
  submitWish: (params: {
    websiteId: string;
    guestId: string;
    message: string;
  }): Promise<ApiResponse<any>> => {
    return fetchApi("/api/wishes", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  // Get public wishes
  getPublicWishes: (websiteId: string): Promise<ApiResponse<Wish[]>> => {
    return fetchApi<Wish[]>(`/api/wishes/website/${websiteId}/public`);
  },

  // Report a wish
  reportWish: (wishId: string): Promise<ApiResponse<any>> => {
    return fetchApi(`/api/wishes/${wishId}/report`, {
      method: "PUT",
    });
  },
};

