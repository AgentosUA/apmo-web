/** Cookies where v1 kept the tokens readable by JS. The session now lives in httpOnly cookies. */
const LEGACY_TOKEN_COOKIES = ['token', 'refreshToken'];

/** Removes the old JS-readable tokens so they don't linger in browsers. */
const clearLegacyTokens = () => {
  if (typeof document === 'undefined') return;

  LEGACY_TOKEN_COOKIES.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; path=/`;
  });
};

export { clearLegacyTokens };
