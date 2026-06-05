const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

export type ApiErrorBody = { error?: string; message?: string };

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

type FetchOptions = Omit<RequestInit, "headers"> & {
  token?: string;
  headers?: HeadersInit;
};

function buildHeaders(options: FetchOptions, token?: string) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (options.headers) {
    const provided =
      options.headers instanceof Headers
        ? options.headers
        : new Headers(options.headers);
    provided.forEach((value, key) => headers.set(key, value));
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

async function resolveToken(explicitToken?: string) {
  if (explicitToken) return explicitToken;

  if (typeof window !== "undefined") {
    const clerk = (window as Window & {
      Clerk?: {
        session?: {
          getToken?: () => Promise<string | null>;
        };
      };
    }).Clerk;

    try {
      const token = await clerk?.session?.getToken?.();
      if (typeof token === "string" && token.length > 0) {
        return token;
      }
    } catch {
      // ignore
    }
  }

  return undefined;
}

function normalizePath(path: string) {
  if (path.startsWith("/api/")) return path.slice(4);
  if (path === "/api") return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const token = await resolveToken(options.token);
  const headers = buildHeaders(options, token);

  const url = `${BASE_URL}${normalizePath(path)}`;
  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = (await res
      .json()
      .catch((): ApiErrorBody => ({}))) as ApiErrorBody;
    const message = body.error ?? body.message ?? res.statusText;
    throw new ApiError(res.status, message, body);
  }

  return (await res.json()) as T;
}
