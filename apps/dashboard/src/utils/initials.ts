const WHITESPACE_REGEX = /\s+/;

export function getInitials(name?: string | null): string {
  if (!name) return "";

  const parts = name.trim().split(WHITESPACE_REGEX);
  if (parts.length > 1) {
    return (parts[0][0] + parts.at(-1)?.[0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
