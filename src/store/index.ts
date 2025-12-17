import { create } from 'zustand';
import { User, Status } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: Status;
  error: string | null;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  status: 'idle',
  error: null,

  initialize: async () => {
    set({ status: 'loading' });
    try {
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: user !== null && user !== undefined,
        status: 'success',
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to initialize',
        isAuthenticated: false,
      });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ status: 'loading', error: null });
    try {
      await authService.signIn(email, password);
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: user !== null && user !== undefined,
        status: 'success',
        error: null,
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Sign in failed',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    set({ status: 'loading', error: null });
    try {
      await authService.signUp(email, password);
      const user = await authService.getCurrentUser();
      set({
        user,
        isAuthenticated: user !== null && user !== undefined,
        status: 'success',
        error: null,
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Sign up failed',
        isAuthenticated: false,
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ status: 'loading' });
    try {
      await authService.signOut();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        status: 'idle',
        error: null,
      });
    }
  },

  setUser: (user: User | null) => {
    set({
      user,
      isAuthenticated: user !== null && user !== undefined,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
