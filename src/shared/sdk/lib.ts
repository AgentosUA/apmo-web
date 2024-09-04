import type { AxiosInstance } from 'axios';

import cookieCutter from 'cookie-cutter';

const setTokenFromCookies = (instance: AxiosInstance) => {
  const token = cookieCutter.get('token');
  instance.defaults.headers.common['Authorization'] = token
    ? `Bearer ${token}`
    : undefined;

  return Boolean(token);
};

export { setTokenFromCookies };
