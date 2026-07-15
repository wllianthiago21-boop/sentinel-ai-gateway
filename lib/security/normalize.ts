const INVISIBLE_CHARACTERS = /[\u200B-\u200F\u2060\uFEFF]/g;
const UNSAFE_CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const DIACRITICS = /[\u0300-\u036f]/g;

export function normalizeText(value: string): string {
  return value
    .normalize("NFKC")
    .replace(INVISIBLE_CHARACTERS, "")
    .replace(UNSAFE_CONTROL_CHARACTERS, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

export function tokenize(value: string): string[] {
  const normalized = normalizeText(value)
    .normalize("NFKD")
    .replace(DIACRITICS, "")
    .toLowerCase();

  return normalized.match(/[a-z0-9_]{2,}/g) ?? [];
}

export function truncate(value: string, size: number): string {
  if (value.length <= size) return value;
  return `${value.slice(0, Math.max(0, size - 1))}…`;
}
