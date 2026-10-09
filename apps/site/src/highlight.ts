export type TokenKind = "keyword" | "string" | "comment" | "accent";
export type Token = { text: string; kind?: TokenKind };
export type Lang = keyof typeof grammars;

// Each grammar is one regex whose capture groups map, in order, to token kinds.
const grammars = {
  ts: {
    pattern:
      /(\/\/.*)|("(?:[^"\\]|\\.)*")|\b(import|from|export|const|async|await|switch|case|break|return|new)\b/g,
    kinds: ["comment", "string", "keyword"],
  },
  md: {
    pattern:
      /^(---|```\w*)$|^(#{1,6} .*|[a-z]+:)|(<\/?[A-Z]\w*|\/?>)|("(?:[^"\\]|\\.)*")|\b(import|from)\b/g,
    kinds: ["comment", "accent", "keyword", "string", "keyword"],
  },
  html: {
    pattern: /(<\/?[a-z][a-z0-9]*|\/?>)|("[^"]*")/g,
    kinds: ["keyword", "string"],
  },
  sh: {
    pattern: /^(\$)|(".*")/g,
    kinds: ["comment", "string"],
  },
} satisfies Record<string, { pattern: RegExp; kinds: TokenKind[] }>;

export function highlight(code: string, lang: Lang): Token[][] {
  const { pattern, kinds } = grammars[lang];
  return code.split("\n").map((line) => {
    const tokens: Token[] = [];
    let last = 0;
    for (const match of line.matchAll(pattern)) {
      const group = match.findIndex((g, i) => i > 0 && g !== undefined);
      if (match.index > last) tokens.push({ text: line.slice(last, match.index) });
      tokens.push({ text: match[0], kind: kinds[group - 1] });
      last = match.index + match[0].length;
    }
    if (last < line.length) tokens.push({ text: line.slice(last) });
    return tokens;
  });
}
