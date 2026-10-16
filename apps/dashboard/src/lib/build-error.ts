/** The line of a build's output that names the cause. */
export function buildErrorSummary(error: string) {
  const lines = error.trim().split("\n");
  // Astro prints timestamped progress lines and a "build failed:" heading before the cause.
  return (
    lines.find((line) => line.trim() && !/^\d\d:\d\d:\d\d /.test(line) && !line.endsWith(":")) ??
    lines[0]
  );
}
