// File: /lib/api-client.ts
import type {
  ApiRouteMap,
  ApiResponseTypes,
  ApiRouteParams,
  HttpMethod,
} from "./api-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Helper to replace path parameters in a URL
function replacePathParams(
  path: string,
  params: Record<string, string> | undefined
): string {
  if (!params) return path;

  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`[${key}]`, encodeURIComponent(String(value)));
  });

  return result;
}

// Generic fetch function
export async function apiFetch<
  TRoute extends keyof ApiRouteMap,
  TMethod extends HttpMethod & keyof ApiRouteMap[TRoute],
  TResponse = ApiResponseTypes[TRoute][TMethod],
  TParams = ApiRouteParams[TRoute],
>(
  route: TRoute,
  method: TMethod,
  options?: {
    body?: Record<string, unknown>;
    params?: TParams;
    query?: Record<string, string | number | boolean | undefined>;
  }
): Promise<TResponse> {
  console.log("Sending request to", route, method, options);
  // Build URL with path parameters
  let url = `${API_BASE_URL}${replacePathParams(
    route as string,
    options?.params as Record<string, string>
  )}`;

  // Add query parameters
  if (options?.query) {
    const searchParams = new URLSearchParams();
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url = `${url}?${queryString}`;
    }
  }

  // Make the request
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      (errorData as { error?: string })?.error ??
        `API call failed with status ${response.status}`
    );
  }

  return response.json() as Promise<TResponse>;
}

// Type-safe API client with full route type inference
export const api = {
  request: apiFetch,

  // Type-safe convenience methods for routes that support GET
  get: <
    TRoute extends keyof ApiRouteMap,
    TMethod extends "GET" & keyof ApiRouteMap[TRoute],
  >(
    route: TRoute,
    options?: {
      params?: ApiRouteParams[TRoute];
      query?: Record<string, string | number | boolean | undefined>;
    }
  ) => apiFetch(route, "GET" as TMethod, options),

  // Type-safe convenience methods for routes that support POST
  post: <
    TRoute extends keyof ApiRouteMap,
    TMethod extends "POST" & keyof ApiRouteMap[TRoute],
  >(
    route: TRoute,
    body: Record<string, unknown>,
    options?: {
      params?: ApiRouteParams[TRoute];
      query?: Record<string, string | number | boolean | undefined>;
    }
  ) => apiFetch(route, "POST" as TMethod, { ...options, body }),

  // Type-safe convenience methods for routes that support PUT
  put: <
    TRoute extends keyof ApiRouteMap,
    TMethod extends "PUT" & keyof ApiRouteMap[TRoute],
  >(
    route: TRoute,
    body: Record<string, unknown>,
    options?: {
      params?: ApiRouteParams[TRoute];
      query?: Record<string, string | number | boolean | undefined>;
    }
  ) => apiFetch(route, "PUT" as TMethod, { ...options, body }),

  // Type-safe convenience methods for routes that support DELETE
  delete: <
    TRoute extends keyof ApiRouteMap,
    TMethod extends "DELETE" & keyof ApiRouteMap[TRoute],
  >(
    route: TRoute,
    body?: Record<string, unknown>,
    options?: {
      params?: ApiRouteParams[TRoute];
      query?: Record<string, string | number | boolean | undefined>;
    }
  ) => apiFetch(route, "DELETE" as TMethod, options),

  // Type-safe convenience methods for routes that support PATCH
  patch: <
    TRoute extends keyof ApiRouteMap,
    TMethod extends "PATCH" & keyof ApiRouteMap[TRoute],
  >(
    route: TRoute,
    body: Record<string, unknown>,
    options?: {
      params?: ApiRouteParams[TRoute];
      query?: Record<string, string | number | boolean | undefined>;
    }
  ) => apiFetch(route, "PATCH" as TMethod, { ...options, body }),
};
