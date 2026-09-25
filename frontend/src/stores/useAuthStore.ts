import { create } from "zustand";
import { type User } from "../types/auth";

interface AuthState {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: JSON.parse(sessionStorage.getItem('useer') || 'null'),
    token: sessionStorage.getItem('token'),

    setAuth: (user, token) => {
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('token', token);
        set({ user, token });
    },

    logout: () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        set({ user: null, token: null });
    }
}))