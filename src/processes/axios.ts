'use client';

import cookieCutter from 'cookie-cutter';

import { userEntity } from '@/entities/user/model';
import { apmoApi, instance } from '@/shared/sdk';

let refreshPromise: Promise<string | void> | null = null;

instance.interceptors.request.use(function (config) {
  const token = cookieCutter.get('token');
  const refreshToken = cookieCutter.get('refreshToken');

  if (config.url?.includes('refresh-token')) {
    config.headers.Authorization = refreshToken
      ? `Bearer ${refreshToken}`
      : undefined;
  } else {
    config.headers.Authorization = token ? `Bearer ${token}` : undefined;
  }

  return config;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (!refreshPromise) {
      refreshPromise = apmoApi.user
        .refreshToken()
        .then(({ data: { token, refreshToken } }) => {
          cookieCutter.set('token', token, {
            path: '/',
          });

          cookieCutter.set('refreshToken', refreshToken, {
            path: '/',
          });

          return token;
        })
        .catch(() => {
          userEntity.logout();
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const token = await refreshPromise;

    if (!token) {
      return Promise.reject(error);
    }

    error.config.headers.Authorization = `Bearer ${token}`;

    return instance.request(error.config);
  }
);
