import React, { createContext, useReducer, useCallback, type ReactNode } from "react";
import type { Website, Guest, GuestWithRSVP, RSVPStats, Wish } from "../api";
import { websiteApi, guestApi, rsvpApi, wishApi } from "../api";

// State types
export interface AppState {
    // Current website being managed
    currentWebsite: Website | null;
    websites: Website[];

    // Guests for current website
    guests: GuestWithRSVP[];
    guestsPagination: { page: number; limit: number; total: number; pages: number } | null;

    // RSVP stats for current website
    rsvpStats: RSVPStats | null;

    // Wishes for current website
    wishes: Wish[];
    wishesPagination: { page: number; limit: number; total: number; pages: number } | null;

    // Loading states
    loading: {
        websites: boolean;
        guests: boolean;
        rsvpStats: boolean;
        wishes: boolean;
    };

    // Error states
    error: string | null;

    // Active view
    activeView: "setup" | "guests" | "rsvp" | "wishes";
}

// Actions
type Action =
    | { type: "SET_LOADING"; payload: { key: keyof AppState["loading"]; value: boolean } }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "SET_WEBSITES"; payload: Website[] }
    | { type: "SET_CURRENT_WEBSITE"; payload: Website | null }
    | { type: "ADD_WEBSITE"; payload: Website }
    | { type: "UPDATE_WEBSITE"; payload: Website }
    | { type: "REMOVE_WEBSITE"; payload: string }
    | { type: "SET_GUESTS"; payload: { guests: GuestWithRSVP[]; pagination: AppState["guestsPagination"] } }
    | { type: "ADD_GUEST"; payload: GuestWithRSVP }
    | { type: "ADD_GUESTS"; payload: GuestWithRSVP[] }
    | { type: "UPDATE_GUEST"; payload: GuestWithRSVP }
    | { type: "REMOVE_GUEST"; payload: string }
    | { type: "SET_RSVP_STATS"; payload: RSVPStats | null }
    | { type: "SET_WISHES"; payload: { wishes: Wish[]; pagination: AppState["wishesPagination"] } }
    | { type: "UPDATE_WISH"; payload: Wish }
    | { type: "SET_ACTIVE_VIEW"; payload: AppState["activeView"] };

// Initial state
const initialState: AppState = {
    currentWebsite: null,
    websites: [],
    guests: [],
    guestsPagination: null,
    rsvpStats: null,
    wishes: [],
    wishesPagination: null,
    loading: {
        websites: false,
        guests: false,
        rsvpStats: false,
        wishes: false,
    },
    error: null,
    activeView: "setup",
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case "SET_LOADING":
            return {
                ...state,
                loading: { ...state.loading, [action.payload.key]: action.payload.value },
            };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "SET_WEBSITES":
            return { ...state, websites: action.payload };
        case "SET_CURRENT_WEBSITE":
            return { ...state, currentWebsite: action.payload };
        case "ADD_WEBSITE":
            return { ...state, websites: [...state.websites, action.payload] };
        case "UPDATE_WEBSITE":
            return {
                ...state,
                websites: state.websites.map((w) =>
                    w._id === action.payload._id ? action.payload : w
                ),
                currentWebsite:
                    state.currentWebsite?._id === action.payload._id
                        ? action.payload
                        : state.currentWebsite,
            };
        case "REMOVE_WEBSITE":
            return {
                ...state,
                websites: state.websites.filter((w) => w._id !== action.payload),
                currentWebsite:
                    state.currentWebsite?._id === action.payload ? null : state.currentWebsite,
            };
        case "SET_GUESTS":
            return {
                ...state,
                guests: action.payload.guests,
                guestsPagination: action.payload.pagination,
            };
        case "ADD_GUEST":
            return { ...state, guests: [...state.guests, action.payload] };
        case "ADD_GUESTS":
            return { ...state, guests: [...state.guests, ...action.payload] };
        case "UPDATE_GUEST":
            return {
                ...state,
                guests: state.guests.map((g) =>
                    g._id === action.payload._id ? action.payload : g
                ),
            };
        case "REMOVE_GUEST":
            return {
                ...state,
                guests: state.guests.filter((g) => g._id !== action.payload),
            };
        case "SET_RSVP_STATS":
            return { ...state, rsvpStats: action.payload };
        case "SET_WISHES":
            return {
                ...state,
                wishes: action.payload.wishes,
                wishesPagination: action.payload.pagination,
            };
        case "UPDATE_WISH":
            return {
                ...state,
                wishes: state.wishes.map((w) =>
                    w._id === action.payload._id ? action.payload : w
                ),
            };
        case "SET_ACTIVE_VIEW":
            return { ...state, activeView: action.payload };
        default:
            return state;
    }
}

// Context type
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<Action>;
    // Actions
    loadWebsites: () => Promise<void>;
    createWebsite: (data: { publishId: string; name: string; description?: string; eventDate?: string }) => Promise<Website>;
    updateWebsite: (id: string, data: Partial<Website>) => Promise<void>;
    deleteWebsite: (id: string) => Promise<void>;
    selectWebsite: (website: Website | null) => void;
    loadGuests: (websiteId: string, page?: number) => Promise<void>;
    createGuest: (data: { name: string; email?: string; phone?: string; maxAttendees?: number }) => Promise<Guest>;
    bulkCreateGuests: (guests: Array<{ name: string; email?: string; phone?: string; maxAttendees?: number }>) => Promise<void>;
    updateGuest: (guestId: string, data: Partial<Guest>) => Promise<void>;
    deleteGuest: (guestId: string) => Promise<void>;
    loadRSVPStats: (websiteId: string) => Promise<void>;
    loadWishes: (websiteId: string, page?: number) => Promise<void>;
    toggleWishVisibility: (wishId: string) => Promise<void>;
    toggleWishApproval: (wishId: string) => Promise<void>;
    setActiveView: (view: AppState["activeView"]) => void;
    clearError: () => void;
}

// Create context
export const AppContext = createContext<AppContextType | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    // Load all websites
    const loadWebsites = useCallback(async () => {
        dispatch({ type: "SET_LOADING", payload: { key: "websites", value: true } });
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const websites = await websiteApi.getAll();
            dispatch({ type: "SET_WEBSITES", payload: websites });
        } catch (err) {
            dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : "Failed to load websites" });
        } finally {
            dispatch({ type: "SET_LOADING", payload: { key: "websites", value: false } });
        }
    }, []);

    // Create website
    const createWebsite = useCallback(async (data: { publishId: string; name: string; description?: string; eventDate?: string }) => {
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const website = await websiteApi.create(data);
            dispatch({ type: "ADD_WEBSITE", payload: website });
            return website;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create website";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, []);

    // Update website
    const updateWebsite = useCallback(async (id: string, data: Partial<Website>) => {
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const website = await websiteApi.update(id, data);
            dispatch({ type: "UPDATE_WEBSITE", payload: website });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update website";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, []);

    // Delete website
    const deleteWebsite = useCallback(async (id: string) => {
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            await websiteApi.delete(id);
            dispatch({ type: "REMOVE_WEBSITE", payload: id });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete website";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, []);

    // Select website
    const selectWebsite = useCallback((website: Website | null) => {
        dispatch({ type: "SET_CURRENT_WEBSITE", payload: website });
    }, []);

    // Load guests
    const loadGuests = useCallback(async (websiteId: string, page = 1) => {
        dispatch({ type: "SET_LOADING", payload: { key: "guests", value: true } });
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const result = await guestApi.getByWebsite(websiteId, page);
            dispatch({ type: "SET_GUESTS", payload: { guests: result.guests, pagination: result.pagination } });
        } catch (err) {
            dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : "Failed to load guests" });
        } finally {
            dispatch({ type: "SET_LOADING", payload: { key: "guests", value: false } });
        }
    }, []);

    // Create guest
    const createGuest = useCallback(async (data: { name: string; email?: string; phone?: string; maxAttendees?: number }) => {
        if (!state.currentWebsite) throw new Error("No website selected");
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const guest = await guestApi.create(state.currentWebsite._id, data);
            dispatch({ type: "ADD_GUEST", payload: guest as GuestWithRSVP });
            return guest;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create guest";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, [state.currentWebsite]);

    // Bulk create guests
    const bulkCreateGuests = useCallback(async (guests: Array<{ name: string; email?: string; phone?: string; maxAttendees?: number }>) => {
        if (!state.currentWebsite) throw new Error("No website selected");
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const result = await guestApi.bulkCreate(state.currentWebsite._id, guests);
            dispatch({ type: "ADD_GUESTS", payload: result.guests as GuestWithRSVP[] });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create guests";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, [state.currentWebsite]);

    // Update guest
    const updateGuest = useCallback(async (guestId: string, data: Partial<Guest>) => {
        if (!state.currentWebsite) throw new Error("No website selected");
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const guest = await guestApi.update(state.currentWebsite._id, guestId, data);
            dispatch({ type: "UPDATE_GUEST", payload: guest as GuestWithRSVP });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to update guest";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, [state.currentWebsite]);

    // Delete guest
    const deleteGuest = useCallback(async (guestId: string) => {
        if (!state.currentWebsite) throw new Error("No website selected");
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            await guestApi.delete(state.currentWebsite._id, guestId);
            dispatch({ type: "REMOVE_GUEST", payload: guestId });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to delete guest";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, [state.currentWebsite]);

    // Load RSVP stats
    const loadRSVPStats = useCallback(async (websiteId: string) => {
        dispatch({ type: "SET_LOADING", payload: { key: "rsvpStats", value: true } });
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const stats = await rsvpApi.getStats(websiteId);
            dispatch({ type: "SET_RSVP_STATS", payload: stats });
        } catch (err) {
            dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : "Failed to load RSVP stats" });
        } finally {
            dispatch({ type: "SET_LOADING", payload: { key: "rsvpStats", value: false } });
        }
    }, []);

    // Load wishes
    const loadWishes = useCallback(async (websiteId: string, page = 1) => {
        dispatch({ type: "SET_LOADING", payload: { key: "wishes", value: true } });
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const result = await wishApi.getByWebsite(websiteId, page);
            dispatch({ type: "SET_WISHES", payload: { wishes: result.wishes, pagination: result.pagination } });
        } catch (err) {
            dispatch({ type: "SET_ERROR", payload: err instanceof Error ? err.message : "Failed to load wishes" });
        } finally {
            dispatch({ type: "SET_LOADING", payload: { key: "wishes", value: false } });
        }
    }, []);

    // Toggle wish visibility
    const toggleWishVisibility = useCallback(async (wishId: string) => {
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const wish = await wishApi.toggleVisibility(wishId);
            dispatch({ type: "UPDATE_WISH", payload: wish });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to toggle wish visibility";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, []);

    // Toggle wish approval
    const toggleWishApproval = useCallback(async (wishId: string) => {
        dispatch({ type: "SET_ERROR", payload: null });
        try {
            const wish = await wishApi.toggleApproval(wishId);
            dispatch({ type: "UPDATE_WISH", payload: wish });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to toggle wish approval";
            dispatch({ type: "SET_ERROR", payload: message });
            throw err;
        }
    }, []);

    // Set active view
    const setActiveView = useCallback((view: AppState["activeView"]) => {
        dispatch({ type: "SET_ACTIVE_VIEW", payload: view });
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        dispatch({ type: "SET_ERROR", payload: null });
    }, []);

    const value: AppContextType = {
        state,
        dispatch,
        loadWebsites,
        createWebsite,
        updateWebsite,
        deleteWebsite,
        selectWebsite,
        loadGuests,
        createGuest,
        bulkCreateGuests,
        updateGuest,
        deleteGuest,
        loadRSVPStats,
        loadWishes,
        toggleWishVisibility,
        toggleWishApproval,
        setActiveView,
        clearError,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
