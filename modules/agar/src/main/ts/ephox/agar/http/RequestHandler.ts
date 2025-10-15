import { Arr, Optional } from '@ephox/katamari';
import { PathPattern } from '@ephox/polaris';

export interface RequestHandlerDetails {
  readonly params: Record<string, string>;
  readonly request: Request;
}

export type RawRequestHandler = (requestDetails: Request) => Promise<Response>;

export type RequestHandler = (requestDetails: RequestHandlerDetails) => Promise<Response>;

export type RequestMatcher = (request: Request) => Optional<Promise<Response>>;

const matchMethod = (request: Request, method: string): boolean =>
  request.method.toUpperCase() === method.toUpperCase();

const makeMethodMatcher = (method: string) => (pathPattern: string, handler: RequestHandler) => {
  const pathMatcher = PathPattern.makePathMatcher(pathPattern);

  return (request: Request): Optional<Promise<Response>> => {
    if (matchMethod(request, method)) {
      const url = new URL(request.url);
      return pathMatcher(url.pathname).map((params) => handler({ params, request }));
    } else {
      return Optional.none();
    }
  };
};

export const get = makeMethodMatcher('GET');
export const post = makeMethodMatcher('POST');
export const put = makeMethodMatcher('PUT');
export const del = makeMethodMatcher('DELETE');
export const patch = makeMethodMatcher('PATCH');

export const findRequestHandler = (handlers: RequestMatcher[], request: Request): Optional<Promise<Response>> =>
  Arr.findMap(handlers, (handler) => handler(request));
