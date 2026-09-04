import { z } from "zod";
import { useAuthStore } from "@/features/auth/store/auth.store";
import config from "@/config/environment";


const { API_URL } = config;
export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const tokensSchema = z.object({
  access_token: z.string().min(1),
  refresh_token: z.string().min(1),
});

type Tokens = z.infer<typeof tokensSchema>;

const jsonHeaders = {
  "Content-Type": "application/json",
};

const buildUrl = (path: string) => {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const readPayload = async (res: Response) => {
  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

let refreshInFlight: Promise<Tokens | null> | null = null;

const refreshTokens = async (): Promise<Tokens | null> => {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return null;

  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    const payload = await readPayload(res);

    if (!res.ok) {
      useAuthStore.getState().logout();
      return null;
    }

    const parsed = tokensSchema.safeParse(payload);
    if (!parsed.success) {
      useAuthStore.getState().logout();
      return null;
    }

    useAuthStore.getState().setTokens(parsed.data);
    return parsed.data;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
};

type ApiFetchInit = RequestInit & {
  auth?: boolean;
};

const handleResponse = async <T>(res: Response, schema?: z.ZodType<T>) => {
  const payload = await readPayload(res);

  if (!res.ok) {
    const message =
      typeof payload === "object" && payload && "message" in payload
        ? String((payload as any).message)
        : res.statusText;

    throw new ApiError(res.status, message || "Request failed", payload);
  }

  if (!schema) return payload as T;

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(500, "Invalid response from server", parsed.error);
  }

  return parsed.data;
};


export const apiFetch = async <T>(
  path: string,
  init: ApiFetchInit = {},
  schema?: z.ZodType<T>,
): Promise<T> => {
  const url = buildUrl(path);
  const auth = Boolean(init.auth);

  const headers = new Headers(init.headers);

  if (auth) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const isJsonBody = typeof init.body === "string";

  if (isJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, { ...init, headers });

  if (res.status === 401 && auth) {
    const refreshed = await refreshTokens();

    if (refreshed) {
      const retryHeaders = new Headers(init.headers);
      retryHeaders.set("Authorization", `Bearer ${refreshed.access_token}`);
      if (typeof init.body === "string" && !retryHeaders.has("Content-Type")) {
        retryHeaders.set("Content-Type", "application/json");
      }

      const retryRes = await fetch(url, { ...init, headers: retryHeaders });
      return handleResponse(retryRes, schema);
    }
  }

  return handleResponse(res, schema);
};
