import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface GeolocationState {
    lat: number | null;
    lng: number | null;
    loading: boolean;
    error: string | null;
    requestLocation: () => void;
}

export const useGeolocationStore = create<GeolocationState>((set) => ({
    lat: null,
    lng: null,
    loading: false,
    error: null,
    requestLocation: () => {
        if (!navigator.geolocation) {
            set({ error: 'Geolocation is not supported' });
            return;
        }
        set({ loading: true, error: null });
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                set({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    loading: false,
                });
            },
            (err) => {
                set({ error: err.message, loading: false });
            },
        );
    },
}));

interface AuthState {
    token: string | null;
    admin: { id: string; email: string; role: string } | null;
    setAuth: (token: string, admin: any) => void;
    clearAuth: () => void;
}

// Auth store with localStorage persistence — token survives page refresh
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            admin: null,
            setAuth: (token, admin) => set({ token, admin }),
            clearAuth: () => set({ token: null, admin: null }),
        }),
        {
            name: 'qareeb-auth',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);

interface ChatState {
    isOpen: boolean;
    messages: { from: 'user' | 'bot'; text: string }[];
    toggleChat: () => void;
    addMessage: (from: 'user' | 'bot', text: string) => void;
    clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
    isOpen: false,
    messages: [],
    toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
    addMessage: (from, text) =>
        set((state) => ({ messages: [...state.messages, { from, text }] })),
    clearMessages: () => set({ messages: [] }),
}));
