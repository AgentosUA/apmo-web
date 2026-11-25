'use client';

import { userEntity } from '@/entities/user/model';
import { api, http, isApiError } from '@/shared/sdk';

/** One refresh at a time: concurrent 401s wait for the same promise. */
let refreshPromise: Promise<boolean> | null = null;

/** The API rotates the httpOnly cookies; we only need to know whether it worked. */
const refreshSession = () => {
  refreshPromise ??= api.auth
    .refreshToken()
    .then(() => true)
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    if (!isApiError(error, 401) || !config) {
      return Promise.reject(error);
    }

    // The refresh itself, logout, or a request that already failed after a
    // successful refresh: the session is over.
    if (config._retry) {
      userEntity.expireSession();

      return Promise.reject(error);
    }

    const refreshed = await refreshSession();

    if (!refreshed) {
      userEntity.expireSession();

      return Promise.reject(error);
    }

    return http.request({ ...config, _retry: true });
  }
);
