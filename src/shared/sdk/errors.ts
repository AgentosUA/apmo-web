import { AxiosError } from 'axios';
import { ZodError } from 'zod';

/**
 * Extracts a human-readable message from anything thrown by the SDK:
 * an API error (`{ message }` from NestJS, string or string[]), a request
 * schema violation, or an unknown error. Falls back to an i18n key.
 */
const getApiErrorMessage = (error: unknown, fallback = 'common:unknownError'): string => {
  if (error instanceof AxiosError) {
    const message: unknown = error.response?.data?.message;

    if (Array.isArray(message)) return message.join(', ');
    if (typeof message === 'string' && message) return message;

    return fallback;
  }

  if (error instanceof ZodError) {
    const issue = error.issues[0];

    if (!issue) return fallback;

    // The path tells which field is wrong ("mission.markers.3.width: …").
    return issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message;
  }

  return fallback;
};

const isApiError = (error: unknown, status?: number): error is AxiosError =>
  error instanceof AxiosError && (status === undefined || error.response?.status === status);

export { getApiErrorMessage, isApiError };
