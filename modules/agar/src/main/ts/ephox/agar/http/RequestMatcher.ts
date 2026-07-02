import { Fun, Optional } from '@ephox/katamari';
import { PathPattern } from '@ephox/polaris';

import type { HttpMethod } from './HttpMethod';

const matchMethod = (request: Request, method: HttpMethod): boolean =>
  request.method.toLowerCase() === method.toLowerCase();

/**
 * Builds a matcher that tests a `Request` against an HTTP method and URL path pattern.
 *
 * The `pattern` is matched against the request URL's pathname only — the protocol,
 * host, port, and query string of the request are not considered. The pattern may
 * contain placeholder segments (e.g. `/users/:id`) whose captured values are returned
 * as a record on match.
 *
 * Returns `Optional.some(params)` when both the method and path match, otherwise `Optional.none()`.
 */
export const makeRequestMatcher = (method: HttpMethod, pattern: string) => {
  const pathMatcher = PathPattern.makePathMatcher(pattern);
  return (request: Request): Optional<Record<string, string>> => {
    if (matchMethod(request, method)) {
      const url = new URL(request.url);
      return pathMatcher(url.pathname);
    } else {
      return Optional.none();
    }
  };
};

export const get = Fun.curry(makeRequestMatcher, 'get');
export const post = Fun.curry(makeRequestMatcher, 'post');
export const put = Fun.curry(makeRequestMatcher, 'put');
export const del = Fun.curry(makeRequestMatcher, 'delete');
export const patch = Fun.curry(makeRequestMatcher, 'patch');
