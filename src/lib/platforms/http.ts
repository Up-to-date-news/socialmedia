/** Thin fetch wrapper: throws with a readable message on non-2xx instead of silently returning bad JSON. */
export async function fetchJson<T = any>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: unknown;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    const message =
      (body as any)?.error?.message ??
      (body as any)?.message ??
      (body as any)?.error ??
      `HTTP ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return body as T;
}
