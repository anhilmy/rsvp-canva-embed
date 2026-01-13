// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get stored token
const getToken = () => localStorage.getItem('admin_token') || 'admin123';

// Generic fetch wrapper
async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || 'Request failed');
    }

    return response.json();
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
}

export interface Guest {
    _id: string;
    websiteId: string;
    name: string;
    email?: string;
    phone?: string;
    uniqueCode: string;
    maxAttendees: number;
    isManual: boolean;
    createdAt: string;
}

export interface RSVP {
    _id: string;
    guestId: string;
    websiteId: string;
    status: 'attending' | 'not_attending' | 'maybe';
    attendeeCount: number;
    dietaryRestrictions?: string;
    submittedAt: string;
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
}

export interface GuestWithRSVP extends Guest {
    rsvp?: RSVP;
}

export interface RSVPStats {
    total: number;
    attending: number;
    notAttending: number;
    maybe: number;
    pending: number;
    totalAttendees: number;
}

// Website API
export const websiteApi = {
    getAll: () => apiFetch<{ websites: Website[]; total: number; pages: number }>('/websites'),
    getById: (id: string) => apiFetch<Website>(`/websites/${id}`),
    create: (data: { publishId: string; name: string; description?: string; eventDate?: string }) =>
        apiFetch<Website>('/websites', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Website>) =>
        apiFetch<Website>(`/websites/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch<{ message: string }>(`/websites/${id}`, { method: 'DELETE' }),
};

// Guest API
export const guestApi = {
    getByWebsite: (websiteId: string, page = 1, limit = 50) =>
        apiFetch<{ guests: Guest[]; total: number; pages: number }>(
            `/guests/website/${websiteId}?page=${page}&limit=${limit}`
        ),
    create: (websiteId: string, data: { name: string; email?: string; maxAttendees?: number }) =>
        apiFetch<Guest>(`/guests/${websiteId}`, { method: 'POST', body: JSON.stringify(data) }),
    createBulk: (websiteId: string, guests: Array<{ name: string; email?: string; maxAttendees?: number }>) =>
        apiFetch<{ guests: Guest[]; count: number }>(`/guests/${websiteId}/bulk`, {
            method: 'POST',
            body: JSON.stringify({ guests }),
        }),
    delete: (id: string) =>
        apiFetch<{ message: string }>(`/guests/${id}`, { method: 'DELETE' }),
};

// RSVP API
export const rsvpApi = {
    getStats: (websiteId: string) =>
        apiFetch<RSVPStats>(`/rsvp/stats/${websiteId}`),
    getGuestStatus: (websiteId: string, page = 1, limit = 50) =>
        apiFetch<{ guests: GuestWithRSVP[]; total: number; pages: number; stats: RSVPStats }>(
            `/rsvp/status/${websiteId}?page=${page}&limit=${limit}`
        ),
};

// Wish API
export const wishApi = {
    getByWebsite: (websiteId: string, page = 1, limit = 50) =>
        apiFetch<{ wishes: Wish[]; total: number; pages: number }>(
            `/wishes/website/${websiteId}?page=${page}&limit=${limit}`
        ),
    toggleApproval: (id: string) =>
        apiFetch<Wish>(`/wishes/${id}/toggle-approval`, { method: 'POST' }),
    toggleVisibility: (id: string) =>
        apiFetch<Wish>(`/wishes/${id}/toggle-visibility`, { method: 'POST' }),
    delete: (id: string) =>
        apiFetch<{ message: string }>(`/wishes/${id}`, { method: 'DELETE' }),
};
