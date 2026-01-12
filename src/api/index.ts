// API configuration - uses webpack DefinePlugin variable or defaults
declare const BACKEND_HOST: string | undefined;

// Lazy initialized config
let API_BASE_URL: string;
let ADMIN_TOKEN: string;

function getApiConfig() {
    if (!API_BASE_URL) {
        // BACKEND_HOST is injected by webpack DefinePlugin
        const backendHost = typeof BACKEND_HOST !== "undefined" ? BACKEND_HOST : "http://localhost:3001";
        API_BASE_URL = `${backendHost}/api`;
    }
    if (!ADMIN_TOKEN) {
        // For now, use a default token - in production this should be handled securely
        ADMIN_TOKEN = "admin123";
    }
    return { API_BASE_URL, ADMIN_TOKEN };
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const { API_BASE_URL } = getApiConfig();
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({
            error: "Unknown error",
        }));
        throw new Error(error.error || error.message || "Request failed");
    }

    return response.json();
}

// Admin API (requires authentication)
function adminFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const { ADMIN_TOKEN } = getApiConfig();
    return apiFetch<T>(endpoint, {
        ...options,
        headers: {
            ...options.headers,
            Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
    });
}

// Types
export interface Website {
    _id: string;
    publishId: string;
    name: string;
    description?: string;
    eventDate?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Guest {
    _id: string;
    websiteId: string;
    name: string;
    email?: string;
    phone?: string;
    uniqueCode: string;
    maxAttendees: number;
    createdAt: string;
    updatedAt: string;
}

export interface RSVP {
    _id: string;
    guestId: string;
    websiteId: string;
    status: "attending" | "not_attending" | "maybe";
    attendeeCount: number;
    dietaryRestrictions?: string;
    submittedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface Wish {
    _id: string;
    guestId: string;
    websiteId: string;
    guestName: string;
    message: string;
    isApproved: boolean;
    isHidden: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RSVPStats {
    total: number;
    attending: number;
    notAttending: number;
    maybe: number;
    pending: number;
    totalAttendees: number;
}

export interface GuestWithRSVP extends Guest {
    rsvp?: RSVP;
}

// Website API
export const websiteApi = {
    // Get all websites (admin)
    getAll: () => adminFetch<Website[]>("/websites"),

    // Get website by ID (admin)
    getById: (id: string) => adminFetch<Website>(`/websites/${id}`),

    // Create website (admin)
    create: (data: { publishId: string; name: string; description?: string; eventDate?: string }) =>
        adminFetch<Website>("/websites", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Update website (admin)
    update: (id: string, data: Partial<Website>) =>
        adminFetch<Website>(`/websites/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    // Delete website (admin)
    delete: (id: string) =>
        adminFetch<{ message: string }>(`/websites/${id}`, {
            method: "DELETE",
        }),

    // Validate website (public)
    validate: (publishId: string) =>
        apiFetch<{ valid: boolean; website?: Website }>(`/websites/validate/${publishId}`),
};

// Guest API
export const guestApi = {
    // Get all guests for a website (admin)
    getByWebsite: (websiteId: string, page = 1, limit = 50) =>
        adminFetch<{
            guests: GuestWithRSVP[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(`/guests/${websiteId}?page=${page}&limit=${limit}`),

    // Get guest by ID (admin)
    getById: (websiteId: string, guestId: string) =>
        adminFetch<Guest>(`/guests/${websiteId}/${guestId}`),

    // Create guest (admin)
    create: (websiteId: string, data: { name: string; email?: string; phone?: string; maxAttendees?: number }) =>
        adminFetch<Guest>(`/guests/${websiteId}`, {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Bulk create guests (admin)
    bulkCreate: (websiteId: string, guests: Array<{ name: string; email?: string; phone?: string; maxAttendees?: number }>) =>
        adminFetch<{ created: number; guests: Guest[] }>(`/guests/${websiteId}/bulk`, {
            method: "POST",
            body: JSON.stringify({ guests }),
        }),

    // Update guest (admin)
    update: (websiteId: string, guestId: string, data: Partial<Guest>) =>
        adminFetch<Guest>(`/guests/${websiteId}/${guestId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    // Delete guest (admin)
    delete: (websiteId: string, guestId: string) =>
        adminFetch<{ message: string }>(`/guests/${websiteId}/${guestId}`, {
            method: "DELETE",
        }),

    // Validate guest (public)
    validate: (code: string, publishId: string) =>
        apiFetch<{ valid: boolean; guest?: Guest; website?: Website }>("/guests/validate", {
            method: "POST",
            body: JSON.stringify({ code, publishId }),
        }),
};

// RSVP API
export const rsvpApi = {
    // Submit RSVP (public)
    submit: (data: {
        guestCode: string;
        publishId: string;
        status: "attending" | "not_attending" | "maybe";
        attendeeCount?: number;
        dietaryRestrictions?: string;
    }) =>
        apiFetch<{ message: string; rsvp: RSVP }>("/rsvp", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Check RSVP status (public)
    check: (guestCode: string, publishId: string) =>
        apiFetch<{ hasSubmitted: boolean; rsvp?: RSVP }>(`/rsvp/check/${guestCode}/${publishId}`),

    // Get RSVP stats (admin)
    getStats: (websiteId: string) => adminFetch<RSVPStats>(`/rsvp/stats/${websiteId}`),
};

// Wish API
export const wishApi = {
    // Submit wish (public)
    submit: (data: { guestCode: string; publishId: string; message: string }) =>
        apiFetch<{ message: string; wish: Wish }>("/wishes", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    // Get public wishes (public)
    getPublic: (publishId: string, page = 1, limit = 20) =>
        apiFetch<{
            wishes: Wish[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(`/wishes/public/${publishId}?page=${page}&limit=${limit}`),

    // Get all wishes for a website (admin)
    getByWebsite: (websiteId: string, page = 1, limit = 50) =>
        adminFetch<{
            wishes: Wish[];
            pagination: { page: number; limit: number; total: number; pages: number };
        }>(`/wishes/${websiteId}?page=${page}&limit=${limit}`),

    // Toggle wish visibility (admin)
    toggleVisibility: (wishId: string) =>
        adminFetch<Wish>(`/wishes/${wishId}/toggle-visibility`, {
            method: "PATCH",
        }),

    // Toggle wish approval (admin)
    toggleApproval: (wishId: string) =>
        adminFetch<Wish>(`/wishes/${wishId}/toggle-approval`, {
            method: "PATCH",
        }),
};

// Generate invite link for a guest
export function generateInviteLink(
    websiteUrl: string,
    guestCode: string,
    guestName?: string
): string {
    const url = new URL(websiteUrl);
    url.searchParams.set("code", guestCode);
    if (guestName) {
        url.searchParams.set("name", guestName);
    }
    return url.toString();
}
