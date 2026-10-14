/** A JSX or HTML attribute value, kept as the author wrote it. */
export type JsxPropValue =
  | { kind: "string"; value: string }
  | { kind: "expression"; source: string }
  | { kind: "flag" };

export type JsxProp = { name: string; value: JsxPropValue };

/** `props` is null when an attribute has no JsxProp form, such as a spread or an unquoted value. */
export type Tag = { name: string; props: JsxProp[] | null; selfClosing: boolean; end: number };

export type Element = { open: Tag; closeStart: number; end: number };

export type ScanMode = { expressions: boolean };

const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

const TAG_NAME = /^[A-Za-z][\w.-]*(?::[A-Za-z][\w-]*)?/;
const ATTR_NAME = /^[A-Za-z_:][\w.:-]*/;
const UNQUOTED_VALUE = /^[^\s"'=<>`]+/;

/** Keywords after which a `/` starts a regular expression rather than dividing. */
const REGEX_KEYWORDS =
  /(?:^|[^\w$])(?:return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/;

/**
 * The index just past the `}` that balances the `{` at `start`, or -1. Skips strings, comments and
 * regular expressions.
 */
export function scanExpression(src: string, start: number): number {
  let depth = 0;
  let i = start;
  while (i < src.length) {
    const char = src[i];
    if (char === "/" && !src.startsWith("//", i) && !src.startsWith("/*", i)) {
      const end = startsRegex(src, start, i) ? skipRegex(src, i) : -1;
      i = end < 0 ? i + 1 : end;
      continue;
    }
    if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return i + 1;
    } else if (char === '"' || char === "'") {
      i = skipQuoted(src, i);
      if (i < 0) return -1;
      continue;
    } else if (char === "`") {
      i = skipTemplate(src, i);
      if (i < 0) return -1;
      continue;
    } else if (src.startsWith("//", i)) {
      const newline = src.indexOf("\n", i);
      i = newline < 0 ? src.length : newline;
      continue;
    } else if (src.startsWith("/*", i)) {
      const close = src.indexOf("*/", i + 2);
      if (close < 0) return -1;
      i = close + 2;
      continue;
    }
    i++;
  }
  return -1;
}

function skipQuoted(src: string, start: number): number {
  const quote = src[start];
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (src[i] === quote) return i + 1;
    else if (src[i] === "\n") return -1;
  }
  return -1;
}

/**
 * Whether the `/` at `slash` opens a regular expression, judged by the token before it: after a
 * value (a name, number, or closing bracket) it divides, and anywhere else it opens a regex.
 */
function startsRegex(src: string, start: number, slash: number): boolean {
  const before = src.slice(start, slash).trimEnd();
  const last = before.at(-1) ?? "{";
  if (/[\w$]/.test(last)) return REGEX_KEYWORDS.test(before);
  return !")]}".includes(last);
}

/** The index past the regular expression at `start` and its flags, or -1 if it does not close on its line. */
function skipRegex(src: string, start: number): number {
  let inClass = false;
  for (let i = start + 1; i < src.length; i++) {
    const char = src[i];
    if (char === "\\") i++;
    else if (char === "\n") return -1;
    else if (char === "[") inClass = true;
    else if (char === "]") inClass = false;
    else if (char === "/" && !inClass) return i + 1 + /^[a-z]*/.exec(src.slice(i + 1))![0].length;
  }
  return -1;
}

function skipTemplate(src: string, start: number): number {
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (src[i] === "`") return i + 1;
    else if (src.startsWith("${", i)) {
      const end = scanExpression(src, i + 1);
      if (end < 0) return -1;
      i = end - 1;
    }
  }
  return -1;
}

/** Parses the opening or self-closing tag at `start`, which must be a `<`. */
export function scanOpenTag(src: string, start: number, mode: ScanMode): Tag | null {
  const name = TAG_NAME.exec(src.slice(start + 1))?.[0] ?? "";
  let i = start + 1 + name.length;
  if (name && !/[\s/>]/.test(src[i] ?? "")) return null;
  let props: JsxProp[] | null = [];
  while (i < src.length) {
    const space = /^\s*/.exec(src.slice(i))![0];
    i += space.length;
    if (src.startsWith("/>", i)) return { name, props, selfClosing: true, end: i + 2 };
    if (src[i] === ">") {
      return { name, props, selfClosing: VOID_ELEMENTS.has(name.toLowerCase()), end: i + 1 };
    }
    if (!name || !space) return null;
    if (src[i] === "{" && mode.expressions) {
      const end = scanExpression(src, i);
      if (end < 0) return null;
      props = null;
      i = end;
      continue;
    }
    const attr = ATTR_NAME.exec(src.slice(i))?.[0];
    if (!attr) return null;
    i += attr.length;
    const equals = /^\s*=\s*/.exec(src.slice(i));
    if (!equals) {
      props?.push({ name: attr, value: { kind: "flag" } });
      continue;
    }
    i += equals[0].length;
    const quote = src[i];
    if (quote === '"' || quote === "'") {
      const close = src.indexOf(quote, i + 1);
      if (close < 0) return null;
      const value = src.slice(i + 1, close);
      props?.push({ name: attr, value: { kind: "string", value } });
      i = close + 1;
    } else if (quote === "{" && mode.expressions) {
      const end = scanExpression(src, i);
      if (end < 0) return null;
      props?.push({ name: attr, value: { kind: "expression", source: src.slice(i + 1, end - 1) } });
      i = end;
    } else {
      const value = UNQUOTED_VALUE.exec(src.slice(i))?.[0];
      if (!value) return null;
      props = null;
      i += value.length;
    }
  }
  return null;
}

function scanCloseTag(src: string, start: number): { name: string; end: number } | null {
  const match = /^<\/\s*([A-Za-z][\w.-]*(?::[A-Za-z][\w-]*)?)?\s*>/.exec(src.slice(start));
  return match ? { name: match[1] ?? "", end: start + match[0].length } : null;
}

/** Finds the whole element opened at `start`, matching nested tags and skipping code and expressions. */
export function scanElement(src: string, start: number, mode: ScanMode): Element | null {
  const open = scanOpenTag(src, start, mode);
  if (!open) return null;
  if (open.selfClosing) return { open, closeStart: open.end, end: open.end };
  const stack = [open.name];
  let i = open.end;
  while (i < src.length) {
    const char = src[i];
    if (char === "\\") {
      i += 2;
    } else if (char === "`") {
      const run = /^`+/.exec(src.slice(i))![0];
      const close = src.indexOf(run, i + run.length);
      i = close < 0 ? i + run.length : close + run.length;
    } else if (char === "{" && mode.expressions) {
      const end = scanExpression(src, i);
      i = end < 0 ? i + 1 : end;
    } else if (src.startsWith("<!--", i)) {
      const close = src.indexOf("-->", i + 4);
      if (close < 0) return null;
      i = close + 3;
    } else if (char === "<") {
      const close = scanCloseTag(src, i);
      if (close) {
        if (close.name !== stack.at(-1)) return null;
        stack.pop();
        if (stack.length === 0) return { open, closeStart: i, end: close.end };
        i = close.end;
        continue;
      }
      const nested = scanOpenTag(src, i, mode);
      if (nested && !nested.selfClosing) stack.push(nested.name);
      i = nested ? nested.end : i + 1;
    } else {
      i++;
    }
  }
  return null;
}

/** The first index in `src` that passes `test` and is not backslash-escaped, or -1. */
export function indexOfUnescaped(src: string, test: (src: string, index: number) => boolean) {
  for (let i = 0; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (test(src, i)) return i;
  }
  return -1;
}

/** Removes the indentation every non-blank line shares. */
export function dedent(text: string): string {
  const lines = text.split("\n");
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => /^[ \t]*/.exec(line)![0].length);
  const indent = indents.length ? Math.min(...indents) : 0;
  return lines
    .map((line) => line.slice(Math.min(indent, /^[ \t]*/.exec(line)![0].length)))
    .join("\n");
}

export function indent(text: string, by = "  "): string {
  return text
    .split("\n")
    .map((line) => (line ? by + line : line))
    .join("\n");
}
