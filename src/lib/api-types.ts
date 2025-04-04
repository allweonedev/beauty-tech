// File: /lib/api-types.ts
import { type NextRequest, type NextResponse } from "next/server";
import { type ApiRouteMap as GeneratedApiRouteMap } from "./generated-api-routes";

// Type utility to extract response type from a handler function
export type InferApiResponse<T> = T extends (
  req: NextRequest,
  ...args: unknown[]
) => Promise<NextResponse<infer R>>
  ? R
  : T extends (req: NextRequest, ...args: unknown[]) => Promise<infer R>
    ? R extends NextResponse<infer S>
      ? S
      : R
    : never;

// Define HTTP methods
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Type for API handlers
export interface ApiHandlers {
  GET?: (req: NextRequest) => Promise<NextResponse>;
  POST?: (req: NextRequest) => Promise<NextResponse>;
  PUT?: (req: NextRequest) => Promise<NextResponse>;
  DELETE?: (req: NextRequest) => Promise<NextResponse>;
  PATCH?: (req: NextRequest) => Promise<NextResponse>;
}

// Type to extract route parameter names from a path
export type ExtractRouteParams<T extends string> =
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  T extends `${infer Start}[${infer Param}]${infer Rest}`
    ? // eslint-disable-next-line @typescript-eslint/no-unused-vars
      { [K in Param]: string } & ExtractRouteParams<Rest>
    : Record<string, never>;

// Use the generated API route map from generated-api-routes.ts
export type ApiRouteMap = GeneratedApiRouteMap;

// Extract response types for all routes and methods
export type ApiResponseTypes = {
  [Route in keyof ApiRouteMap]: {
    [Method in keyof ApiRouteMap[Route]]: InferApiResponse<
      ApiRouteMap[Route][Method]
    >;
  };
};

// Extract parameter types for routes with dynamic segments
export type ApiRouteParams = {
  [Route in keyof ApiRouteMap]: ExtractRouteParams<
    Route extends string ? Route : never
  >;
};
