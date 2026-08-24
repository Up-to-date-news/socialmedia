import { Platform, Post } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include" });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? `Request to ${url} failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  session: () => request<{ authenticated: boolean; email?: string }>("/api/auth/session"),
  login: (email: string, password: string) =>
    request<{ email: string }>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),

  platforms: () => request<{ platforms: Platform[] }>("/api/platforms"),
  saveCredentials: (platformId: string, values: Record<string, string>) =>
    request<{ ok: true }>(`/api/platforms/${platformId}/credentials`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }),
  removeCredentials: (platformId: string) =>
    request<{ ok: true }>(`/api/platforms/${platformId}/credentials`, { method: "DELETE" }),

  posts: () => request<{ posts: Post[] }>("/api/posts"),
  createPost: (input: {
    title: string;
    content: string;
    imageUrl?: string;
    platformIds: string[];
    scheduledAt?: string;
  }) =>
    request<{ post: Post }>("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  deletePost: (postId: string) =>
    request<{ ok: true; deletedFrom: string[]; restrictedPlatforms: string[] }>(`/api/posts/${postId}`, {
      method: "DELETE",
    }),
  refreshStats: (postId: string) => request<{ post: Post }>(`/api/posts/${postId}/stats`),
  publishScheduledNow: (postId: string) => request<{ post: Post }>(`/api/posts/${postId}/publish`, { method: "POST" }),

  upload: async (file: File): Promise<{ url: string }> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form, credentials: "include" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? "Upload failed");
    return data;
  },
};
