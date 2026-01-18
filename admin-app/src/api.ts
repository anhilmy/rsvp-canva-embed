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

    // Handle 204 No Content responses
    if (response.status === 204) {
        return {} as T;
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

export type InvitationStatus = 'created' | 'invitation_sent';

export interface Guest {
    _id: string;
    websiteId: string;
    name: string;
    email?: string;
    phone?: string;
    greeting?: string;
    personalLink?: string;
    label?: string;
    invitationStatus: InvitationStatus;
    invitationSentAt?: string;
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

// Broadcast Template
export interface BroadcastTemplate {
    _id: string;
    websiteId: string;
    name: string;
    body: string;
    createdAt: string;
    updatedAt: string;
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
    getByWebsite: (websiteId: string, page = 1, limit = 50, label?: string) => {
        let url = `/guests/website/${websiteId}?page=${page}&limit=${limit}`;
        if (label) {
            url += `&label=${encodeURIComponent(label)}`;
        }
        return apiFetch<{ guests: Guest[]; total: number; pages: number; labels: string[] }>(url);
    },
    create: (websiteId: string, data: { name: string; email?: string; phone?: string; greeting?: string; maxAttendees?: number; personalLink?: string; label?: string }) =>
        apiFetch<Guest>(`/guests/${websiteId}`, { method: 'POST', body: JSON.stringify(data) }),
    createBulk: (websiteId: string, guests: Array<{ name: string; email?: string; phone?: string; greeting?: string; maxAttendees?: number; personalLink?: string; label?: string }>) =>
        apiFetch<{ guests: Guest[]; count: number }>(`/guests/${websiteId}/bulk`, {
            method: 'POST',
            body: JSON.stringify({ guests }),
        }),
    update: (id: string, data: { name?: string; email?: string; phone?: string; greeting?: string; maxAttendees?: number; personalLink?: string; label?: string }) =>
        apiFetch<Guest>(`/guests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
        apiFetch<{ message: string }>(`/guests/${id}`, { method: 'DELETE' }),
    bulkDelete: (websiteId: string, ids: string[]) =>
        apiFetch<{ success: boolean; deleted: number }>(`/guests/${websiteId}/bulk`, {
            method: 'DELETE',
            body: JSON.stringify({ ids }),
        }),
    markInvitationSent: (id: string) =>
        apiFetch<Guest>(`/guests/${id}/mark-invitation-sent`, { method: 'PUT' }),
    getLabels: (websiteId: string) =>
        apiFetch<{ labels: string[] }>(`/guests/${websiteId}/labels`),
    exportToExcel: async (websiteId: string, guestIds: string[], templateId?: string): Promise<Blob> => {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';
        const response = await fetch(`${API_BASE_URL}/guests/${websiteId}/export`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`,
            },
            body: JSON.stringify({ guestIds, templateId, baseUrl }),
        });
        if (!response.ok) {
            throw new Error('Export failed');
        }
        return response.blob();
    },
};

// RSVP API
export const rsvpApi = {
    getStats: (websiteId: string) =>
        apiFetch<RSVPStats>(`/rsvp/stats/${websiteId}`),
    getGuestStatus: (websiteId: string, page = 1, limit = 50) =>
        apiFetch<{ guests: GuestWithRSVP[]; total: number; pages: number; stats: RSVPStats }>(
            `/rsvp/status/${websiteId}?page=${page}&limit=${limit}`
        ),
    bulkDelete: (websiteId: string, ids: string[]) =>
        apiFetch<{ success: boolean; deleted: number }>(`/rsvp/${websiteId}/bulk`, {
            method: 'DELETE',
            body: JSON.stringify({ ids }),
        }),
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
    bulkDelete: (websiteId: string, ids: string[]) =>
        apiFetch<{ success: boolean; deleted: number }>(`/wishes/${websiteId}/bulk`, {
            method: 'DELETE',
            body: JSON.stringify({ ids }),
        }),
};

// Broadcast Template API
export const broadcastTemplateApi = {
    getByWebsite: (websiteId: string, page = 1, limit = 20) =>
        apiFetch<{ templates: BroadcastTemplate[]; total: number; pages: number }>(
            `/broadcast-templates/${websiteId}?page=${page}&limit=${limit}`
        ),
    getAllByWebsite: (websiteId: string) =>
        apiFetch<{ templates: BroadcastTemplate[] }>(`/broadcast-templates/${websiteId}/all`),
    getById: (websiteId: string, id: string) =>
        apiFetch<BroadcastTemplate>(`/broadcast-templates/${websiteId}/${id}`),
    create: (websiteId: string, data: { name: string; body: string }) =>
        apiFetch<BroadcastTemplate>(`/broadcast-templates/${websiteId}`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    update: (id: string, data: { name?: string; body?: string }) =>
        apiFetch<BroadcastTemplate>(`/broadcast-templates/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
    delete: (id: string) =>
        apiFetch<{ success: boolean; message: string }>(`/broadcast-templates/${id}`, {
            method: 'DELETE',
        }),
};

// Helper function to fill template with guest data
export function fillBroadcastTemplate(
    templateBody: string,
    guest: Guest,
    baseUrl: string,
    publishId: string
): string {
    const link = guest.personalLink || `${baseUrl}/f/simple/${publishId}?code=${guest.uniqueCode}`;

    return templateBody
        .replace(/\[to\]/g, guest.name)
        .replace(/\[greeting\]/g, guest.greeting || '')
        .replace(/\[link\]/g, link);
}
