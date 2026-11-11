/**
 * Minimal SQF value parser / serializer for Sweet Markers clipboard data.
 *
 * SWT copies markers with `copyToClipboard str _array` and loads them with
 * `call compile`, so the clipboard holds SQF, not JSON. The difference that
 * matters: a `"` inside a string is escaped by doubling it (`"say ""hi"""`),
 * which JSON.parse rejects (and JSON's `\"` breaks `call compile` in Arma).
 */

type SqfValue = string | number | boolean | null | SqfValue[];

class SqfParseError extends Error {}

const parseSqf = (input: string): SqfValue => {
  let i = 0;
  const text = input;

  const skip = () => {
    while (i < text.length) {
      const ch = text[i];
      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t' || ch === ';') i++;
      else if (ch === '/' && text[i + 1] === '/') {
        while (i < text.length && text[i] !== '\n') i++;
      } else break;
    }
  };

  const parseString = (): string => {
    const quote = text[i];
    i++;
    let out = '';
    while (i < text.length) {
      const ch = text[i];
      if (ch === quote) {
        if (text[i + 1] === quote) {
          out += quote;
          i += 2;
          continue;
        }
        i++;
        return out;
      }
      out += ch;
      i++;
    }
    throw new SqfParseError('Unterminated string');
  };

  const parseNumber = (): number => {
    const match = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/i.exec(text.slice(i));
    if (!match) throw new SqfParseError(`Unexpected character "${text[i]}" at ${i}`);
    i += match[0].length;
    return Number(match[0]);
  };

  const parseArray = (): SqfValue[] => {
    i++; // [
    const items: SqfValue[] = [];
    skip();
    if (text[i] === ']') {
      i++;
      return items;
    }
    while (i < text.length) {
      items.push(parseValue());
      skip();
      if (text[i] === ',') {
        i++;
        skip();
        continue;
      }
      if (text[i] === ']') {
        i++;
        return items;
      }
      throw new SqfParseError(`Expected "," or "]" at ${i}`);
    }
    throw new SqfParseError('Unterminated array');
  };

  const parseValue = (): SqfValue => {
    skip();
    const ch = text[i];
    if (ch === '[') return parseArray();
    if (ch === '"' || ch === "'") return parseString();
    const word = /^(true|false|nil|null)\b/i.exec(text.slice(i));
    if (word) {
      i += word[0].length;
      const value = word[0].toLowerCase();
      return value === 'true' ? true : value === 'false' ? false : null;
    }
    return parseNumber();
  };

  const value = parseValue();
  skip();
  if (i < text.length) throw new SqfParseError(`Unexpected trailing data at ${i}`);
  return value;
};

/**
 * Parse clipboard text as SQF, falling back to JSON for data exported by
 * older versions of the app.
 */
const parseSqfOrJson = (input: string): unknown => {
  const text = input.trim();
  try {
    return parseSqf(text);
  } catch (sqfError) {
    try {
      return JSON.parse(text);
    } catch {
      throw sqfError;
    }
  }
};

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return '0';
  // Keep 2 decimals (centimeters) and avoid exponent notation.
  const rounded = Math.round(value * 100) / 100;
  return String(Object.is(rounded, -0) ? 0 : rounded);
};

/** Serialize a value the way SQF `str` does (strings escape `"` as `""`). */
const toSqf = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(toSqf).join(',')}]`;
  if (typeof value === 'string') return `"${value.replaceAll('"', '""')}"`;
  if (typeof value === 'number') return formatNumber(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return 'nil';
};

export { parseSqf, parseSqfOrJson, toSqf, SqfParseError };
export type { SqfValue };
