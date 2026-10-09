export function errorMessage(error: unknown) {
  const body = (error as { error?: { message?: string } } | null)?.error;
  if (body?.message) return body.message;
  return error instanceof Error && error.message ? error.message : "Something went wrong";
}
