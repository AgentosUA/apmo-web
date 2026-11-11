'use client';

import { userEntity } from '@/entities/user/model';
import { api, http, isApiError, tokenStorage } from '@/shared/sdk';

/** One refresh at a time: concurrent 401s wait for the same promise. */
let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = () => {
  refreshPromise ??= api.auth
    .refreshToken()
    .then((tokens) => {
      tokenStorage.set(tokens);

      return tokens.token;
    })
    .catch(() => {
      userEntity.logout();

      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    if (!isApiError(error, 401) || !config || config._retry || !tokenStorage.getRefreshToken()) {
      return Promise.reject(error);
    }

    const token = await refreshAccessToken();

    if (!token) {
      return Promise.reject(error);
    }

    // The request interceptor attaches the fresh token from cookies.
    return http.request({ ...config, _retry: true });
  }
);
