// Auto-generated API route map
// DO NOT EDIT MANUALLY

export interface ApiRouteMap {
  '/api/clients/bulk': {
    POST: typeof import('../app/api/clients/bulk/route').POST;
  };
  '/api/clients/count': {
    GET: typeof import('../app/api/clients/count/route').GET;
  };
  '/api/clients': {
    GET: typeof import('../app/api/clients/route').GET;
    POST: typeof import('../app/api/clients/route').POST;
    PUT: typeof import('../app/api/clients/route').PUT;
    DELETE: typeof import('../app/api/clients/route').DELETE;
  };
  '/api/clients/search': {
    GET: typeof import('../app/api/clients/search/route').GET;
  };
  '/api/contracts/bulk': {
    DELETE: typeof import('../app/api/contracts/bulk/route').DELETE;
  };
  '/api/contracts': {
    GET: typeof import('../app/api/contracts/route').GET;
    POST: typeof import('../app/api/contracts/route').POST;
    PUT: typeof import('../app/api/contracts/route').PUT;
    DELETE: typeof import('../app/api/contracts/route').DELETE;
  };
  '/api/products/bulk': {
    DELETE: typeof import('../app/api/products/bulk/route').DELETE;
  };
  '/api/products/count': {
    GET: typeof import('../app/api/products/count/route').GET;
  };
  '/api/products': {
    GET: typeof import('../app/api/products/route').GET;
    POST: typeof import('../app/api/products/route').POST;
    PUT: typeof import('../app/api/products/route').PUT;
    DELETE: typeof import('../app/api/products/route').DELETE;
  };
  '/api/products/search': {
    GET: typeof import('../app/api/products/search/route').GET;
  };
  '/api/service-orders/bulk': {
    DELETE: typeof import('../app/api/service-orders/bulk/route').DELETE;
  };
  '/api/service-orders': {
    GET: typeof import('../app/api/service-orders/route').GET;
    POST: typeof import('../app/api/service-orders/route').POST;
    PUT: typeof import('../app/api/service-orders/route').PUT;
    DELETE: typeof import('../app/api/service-orders/route').DELETE;
  };
}
