/** Pull a human message out of an HttpErrorResponse-shaped value. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  const body = (error as { error?: unknown } | null)?.error;
  if (typeof body === "string") return body;
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    typeof (body as { error?: unknown }).error === "string"
  ) {
    return (body as { error: string }).error;
  }
  return fallback;
}
