/* eslint-disable @typescript-eslint/consistent-type-imports */
// Auto-generated API route map
// DO NOT EDIT MANUALLY

export interface ApiRouteMap {
  "/api/clients/bulk": {
    POST: typeof import("../app/api/clients/bulk/route").POST;
  };
  "/api/clients": {
    GET: typeof import("../app/api/clients/route").GET;
    POST: typeof import("../app/api/clients/route").POST;
    PUT: typeof import("../app/api/clients/route").PUT;
    DELETE: typeof import("../app/api/clients/route").DELETE;
  };
  "/api/hello": {
    GET: typeof import("../app/api/hello/route").GET;
    POST: typeof import("../app/api/hello/route").POST;
  };
  "/api/products/bulk": {
    DELETE: typeof import("../app/api/products/bulk/route").DELETE;
  };
  "/api/products": {
    GET: typeof import("../app/api/products/route").GET;
    POST: typeof import("../app/api/products/route").POST;
    PUT: typeof import("../app/api/products/route").PUT;
    DELETE: typeof import("../app/api/products/route").DELETE;
  };
  "/api/service-orders/bulk": {
    DELETE: typeof import("../app/api/service-orders/bulk/route").DELETE;
  };
  "/api/service-orders": {
    GET: typeof import("../app/api/service-orders/route").GET;
    POST: typeof import("../app/api/service-orders/route").POST;
    PUT: typeof import("../app/api/service-orders/route").PUT;
    DELETE: typeof import("../app/api/service-orders/route").DELETE;
  };
  "/api/contracts": {
    GET: typeof import("../app/api/contracts/route").GET;
    POST: typeof import("../app/api/contracts/route").POST;
    PUT: typeof import("../app/api/contracts/route").PUT;
    DELETE: typeof import("../app/api/contracts/route").DELETE;
  };
  "/api/contracts/bulk": {
    DELETE: typeof import("../app/api/contracts/bulk/route").DELETE;
  };
}
