interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
  /** "true" opens pages in the v2 editor when PostHog has no answer, as in development. */
  readonly VITE_EDITOR_V2?: string;
}
