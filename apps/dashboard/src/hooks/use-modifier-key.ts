export function useModifierKey() {
  if (typeof navigator === "undefined") return "⌘";
  return navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl";
}
