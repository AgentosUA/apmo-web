const generateRandomId = (length?: 40, name?: string) => {
  return `${name}${Math.random()
    .toString(length)
    .substr(2, length)}`.replaceAll('.', '');
};

const kebabize = (str: string) => {
  return str
    .split('')
    .map((letter, idx) => {
      return letter.toUpperCase() === letter
        ? `${idx !== 0 ? '-' : ''}${letter.toLowerCase()}`
        : letter;
    })
    .join('');
};

export { kebabize, generateRandomId };
