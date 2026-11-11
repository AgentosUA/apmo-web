/**
 * Names for anonymous users in the plan presence list: `<name>#<6 digits>`,
 * e.g. "Rookie#042137". Letters, digits, spaces, `_ . ' -`, max 24 chars
 * (the API rejects anything else and falls back to "Guest#…").
 */
const RANDOM_NAMES = ['Rookie', 'Bambie', 'Random'] as const;

const GUEST_NAME_STORAGE_KEY = 'apmo:guestName';

const generateGuestName = () => {
  const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)];
  const number = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');

  return `${name}#${number}`;
};

/** Same name across reloads and tabs of this browser. */
const getGuestName = () => {
  if (typeof window === 'undefined') return generateGuestName();

  try {
    const saved = window.localStorage.getItem(GUEST_NAME_STORAGE_KEY);

    if (saved) return saved;

    const name = generateGuestName();
    window.localStorage.setItem(GUEST_NAME_STORAGE_KEY, name);

    return name;
  } catch {
    return generateGuestName();
  }
};

export { RANDOM_NAMES, generateGuestName, getGuestName };
