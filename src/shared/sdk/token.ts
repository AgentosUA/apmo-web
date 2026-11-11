import cookieCutter from 'cookie-cutter';

const TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

const isBrowser = () => typeof document !== 'undefined';

const read = (key: string): string | undefined =>
  isBrowser() ? cookieCutter.get(key) || undefined : undefined;

const write = (key: string, value: string) => {
  if (!isBrowser()) return;

  cookieCutter.set(key, value, { path: '/' });
};

/** Auth tokens are kept in cookies so they survive reloads and are shared across tabs. */
const tokenStorage = {
  getToken: () => read(TOKEN_KEY),
  getRefreshToken: () => read(REFRESH_TOKEN_KEY),
  hasToken: () => Boolean(read(TOKEN_KEY)),
  set: ({ token, refreshToken }: { token: string; refreshToken: string }) => {
    write(TOKEN_KEY, token);
    write(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    write(TOKEN_KEY, '');
    write(REFRESH_TOKEN_KEY, '');
  },
};

export { tokenStorage };
