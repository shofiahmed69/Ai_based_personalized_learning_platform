import axios, { type InternalAxiosRequestConfig } from 'axios';

const baseURL = typeof window !== 'undefined' ? '' : process.env.NEXT_PUBLIC_API_URL ?? '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

/** Call this once in Providers so every request gets the latest token from store (avoids 401 on first load). */
export function attachRequestAuth(getToken: () => string | null) {
  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

type RefreshFn = () => Promise<string | null>;

export function setupRefreshInterceptor(onRefresh: RefreshFn, onUnauth: () => void) {
  let refreshing: Promise<string | null> | null = null;

  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean };
      if (err.response?.status !== 401 || original._retry) {
        return Promise.reject(err);
      }
      original._retry = true;
      try {
        refreshing ??= onRefresh();
        const token = await refreshing;
        refreshing = null;
        if (token) {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch {
        refreshing = null;
      }
      onUnauth();
      return Promise.reject(err);
    }
  );
}
