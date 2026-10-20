/**
 * Sätteri syntax features on top of Astro's gfm and smartypants. build-site
 * parses content with these same features before Astro runs, so its MDX check
 * sees exactly the tree the compiler sees.
 */
export const markdownFeatures = { headingAttributes: true };
