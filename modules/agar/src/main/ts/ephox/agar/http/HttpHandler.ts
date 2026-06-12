import { Arr, type Optional } from '@ephox/katamari';

import type { HttpMethod } from './HttpMethod';
import * as RequestMatcher from './RequestMatcher';
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

const makeMethodHttpHandler = (method: HttpMethod) => (pathPattern: string, handler: RequestHandler) => {
  if (!hasMockPrefix(pathPattern)) {
    throw new Error(`Path pattern "${pathPattern}" must start with "${Shared.mockPrefix}"`);
  }

  const requestMatcher = RequestMatcher.makeRequestMatcher(method, pathPattern);

  return (request: Request, abortSignal: AbortSignal): Optional<Promise<Response>> =>
    requestMatcher(request).map((params) => handler({ params, request, abortSignal }));
};

export const get = makeMethodHttpHandler('get');
export const post = makeMethodHttpHandler('post');
export const put = makeMethodHttpHandler('put');
export const del = makeMethodHttpHandler('delete');
export const patch = makeMethodHttpHandler('patch');

export const defaultHandler: RawRequestHandler = async (_req, _signal) => new window.Response(null, { status: 501, statusText: 'Handler not implemented' });

export const resolveRequest = (handlers: HttpHandler[], request: Request, abortSignal: AbortSignal): Promise<Response> =>
  Arr.findMap(handlers, (handler) => handler(request, abortSignal)).getOrThunk(() => defaultHandler(request, abortSignal));
