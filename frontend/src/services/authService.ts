import apiClient from './apiClient';
import type { AuthResponse, LoginDto, RegisterDto, User, ApiResponse } from '@/types';

const ENDPOINT = '/auth';
const USER_KEY = 'dv_user';

// ─── Auth Service ─────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Log in and persist JWT + user in localStorage.
   */
  async login(payload: LoginDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      `${ENDPOINT}/login`,
      payload,
    );
    const result = data.data;
    localStorage.setItem('dv_token', result.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    return result;
  },

  /**
   * Register and persist JWT + user in localStorage.
   */
  async register(payload: RegisterDto): Promise<AuthResponse> {
    const { data } = await apiClient.post<ApiResponse<AuthResponse>>(
      `${ENDPOINT}/register`,
      payload,
    );
    const result = data.data;
    localStorage.setItem('dv_token', result.accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    return result;
  },

  /**
   * Return the cached user from localStorage (no network call needed).
   */
  getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  /**
   * Clear local session data.
   */
  logout(): void {
    localStorage.removeItem('dv_token');
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Check if a JWT token is present locally.
   */
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('dv_token'));
  },

  /**
   * Retrieve the raw JWT token from storage.
   */
  getToken(): string | null {
    return localStorage.getItem('dv_token');
  },
};
