export function initials(name: string) {
  const words = name.trim().split(/\s+/);
  const letters = words.length > 1 ? words[0]![0]! + words.at(-1)![0]! : name.slice(0, 2);
  return letters.toUpperCase();
}
