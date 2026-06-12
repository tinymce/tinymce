import { Fun } from '@ephox/katamari';

import type { HttpMethod } from './HttpMethod';
import * as RequestMatcher from './RequestMatcher';

/**
 * Builds a filter that tests a `Request` against an HTTP method and URL path pattern.
 *
 * The `pattern` is matched against the request URL's pathname only — the protocol,
 * host, port, and query string of the request are not considered. The pattern may
 * contain placeholder segments (e.g. `/users/:id`).
 *
 * Returns `true` when both the method and path match, otherwise `false`.
 */
export const makeRequestFilter = (method: HttpMethod, pattern: string) => {
  const matcher = RequestMatcher.makeRequestMatcher(method, pattern);
  return (request: Request): boolean => matcher(request).isSome();
};

export const get = Fun.curry(makeRequestFilter, 'get');
export const post = Fun.curry(makeRequestFilter, 'post');
export const put = Fun.curry(makeRequestFilter, 'put');
export const del = Fun.curry(makeRequestFilter, 'delete');
export const patch = Fun.curry(makeRequestFilter, 'patch');
