export function useMetaKey() {
  if (typeof navigator === "undefined") return "⌘";
  return navigator.platform.toLowerCase().includes("mac") ? "⌘" : "Ctrl";
}
