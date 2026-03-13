// oxlint-disable no-console
type LogData = Record<string, unknown>;

function formatError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      errorMessage: error.message,
      errorName: error.name,
      stack: error.stack,
    };
  }
  return { errorMessage: JSON.stringify(error) };
}

export const log = {
  info: (event: string, data?: LogData) => console.log({ level: "info", event, ...data }),
  warn: (event: string, data?: LogData) => console.warn({ level: "warn", event, ...data }),
  error: (event: string, error: unknown, data?: LogData) =>
    console.error({ level: "error", event, ...formatError(error), ...data }),
  debug: (event: string, data?: LogData) => console.debug({ level: "debug", event, ...data }),
};
