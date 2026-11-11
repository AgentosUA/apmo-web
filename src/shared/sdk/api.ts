import axios, { type AxiosRequestConfig, type Method } from 'axios';
import { z } from 'zod';

import { tokenStorage } from './token';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Set on a request that was already retried after a token refresh. */
    _retry?: boolean;
    /** Send the refresh token instead of the access token. */
    useRefreshToken?: boolean;
  }
}

const isDev = process.env.NODE_ENV !== 'production';

/** The one and only axios instance — every API section shares it. */
const http = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const token = config.useRefreshToken ? tokenStorage.getRefreshToken() : tokenStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

type RequestOptions<TResponse extends z.ZodType> = Omit<AxiosRequestConfig, 'url' | 'method'> & {
  /** Validates (and normalizes) the payload before it is sent. Throws `ZodError` on failure. */
  body?: z.ZodType;
  /** Describes the response. Mismatches are reported in development, never thrown. */
  response: TResponse;
};

/**
 * Base class for API sections (`AuthApi`, `PlanApi`, …).
 *
 * Each section passes its route prefix to `super()` and exposes typed methods
 * built on `get` / `post` / `patch` / `delete`. Request payloads are parsed
 * with their zod schema before sending; responses are checked against their
 * schema and returned as-is (unknown fields are kept), so a backend that sends
 * slightly more than we describe never breaks the app.
 */
abstract class API {
  static readonly http = http;

  protected readonly http = http;

  constructor(protected readonly basePath = '') {}

  protected get<TResponse extends z.ZodType>(path: string, options: RequestOptions<TResponse>) {
    return this.request('GET', path, options);
  }

  protected post<TResponse extends z.ZodType>(path: string, options: RequestOptions<TResponse>) {
    return this.request('POST', path, options);
  }

  protected patch<TResponse extends z.ZodType>(path: string, options: RequestOptions<TResponse>) {
    return this.request('PATCH', path, options);
  }

  protected delete<TResponse extends z.ZodType>(path: string, options: RequestOptions<TResponse>) {
    return this.request('DELETE', path, options);
  }

  private async request<TResponse extends z.ZodType>(
    method: Method,
    path: string,
    { body, response, data, ...config }: RequestOptions<TResponse>
  ): Promise<z.output<TResponse>> {
    const url = `${this.basePath}${path}`;
    const payload = body && data !== undefined ? body.parse(data) : data;

    const res = await this.http.request({ ...config, method, url, data: payload });

    if (isDev) {
      const result = response.safeParse(res.data);

      if (!result.success) {
        console.warn(`[sdk] ${method} ${url}: response does not match schema`, result.error.issues);
      }
    }

    return res.data as z.output<TResponse>;
  }
}

export { API, http };
