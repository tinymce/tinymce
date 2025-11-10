import { Arr, Optional } from '@ephox/katamari';
import { PathPattern } from '@ephox/polaris';

import * as Shared from './Shared';

export interface RequestHandlerDetails {
  readonly params: Record<string, string>;
  readonly request: Request;
  readonly abortSignal: AbortSignal;
}

export type HttpHandler = (request: Request, abortSignal: AbortSignal) => Optional<Promise<Response>>;

export type RawRequestHandler = (request: Request, abortSignal: AbortSignal) => Promise<Response>;

export type RequestHandler = (requestDetails: RequestHandlerDetails) => Promise<Response>;

const hasMockPrefix = (path: string): boolean => path.startsWith(Shared.mockPrefix);

const matchMethod = (request: Request, method: string): boolean =>
  request.method.toUpperCase() === method.toUpperCase();

const makeMethodHttpHandler = (method: string) => (pathPattern: string, handler: RequestHandler) => {
  const pathMatcher = PathPattern.makePathMatcher(pathPattern);

  if (!hasMockPrefix(pathPattern)) {
    throw new Error(`Path pattern "${pathPattern}" must start with "${Shared.mockPrefix}"`);
  }

  return (request: Request, abortSignal: AbortSignal): Optional<Promise<Response>> => {
    if (matchMethod(request, method)) {
      const url = new URL(request.url);
      return pathMatcher(url.pathname).map((params) => handler({ params, request, abortSignal }));
    } else {
      return Optional.none();
    }
  };
};

export const get = makeMethodHttpHandler('GET');
export const post = makeMethodHttpHandler('POST');
export const put = makeMethodHttpHandler('PUT');
export const del = makeMethodHttpHandler('DELETE');
export const patch = makeMethodHttpHandler('PATCH');

export const defaultHandler: RawRequestHandler = async (_req, _signal) => new window.Response(null, { status: 501, statusText: 'Handler not implemented' });

export const resolveRequest = (handlers: HttpHandler[], request: Request, abortSignal: AbortSignal): Promise<Response> =>
  Arr.findMap(handlers, (handler) => handler(request, abortSignal)).getOrThunk(() => defaultHandler(request, abortSignal));
