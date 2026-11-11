enum Language {
  EN = 'en',
  CZ = 'cz',
  UK = 'uk',
}

const isLanguage = (value: unknown): value is Language =>
  Object.values(Language).includes(value as Language);

export { Language, isLanguage };
