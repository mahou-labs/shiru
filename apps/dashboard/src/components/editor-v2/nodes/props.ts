import type { JsxProp, JsxPropValue } from "./scan";

export type { JsxProp, JsxPropValue };

export function getProp(props: JsxProp[], name: string): JsxPropValue | undefined {
  return props.find((prop) => prop.name === name)?.value;
}

/** The prop's string value, or null when it is missing or not a plain string. */
export function getStringProp(props: JsxProp[], name: string): string | null {
  const value = getProp(props, name);
  return value?.kind === "string" ? value.value : null;
}

/** Sets a prop in place, or appends it, keeping the author's order. A null value removes it. */
export function setProp(props: JsxProp[], name: string, value: JsxPropValue | null): JsxProp[] {
  if (value === null) return props.filter((prop) => prop.name !== name);
  if (!props.some((prop) => prop.name === name)) return [...props, { name, value }];
  return props.map((prop) => (prop.name === name ? { name, value } : prop));
}
