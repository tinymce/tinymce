import { Fun, Optional } from '@ephox/katamari';
import { PathPattern } from '@ephox/polaris';

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch';
type HttpMethod = Method | Uppercase<Method>;

const matchMethod = (request: Request, method: HttpMethod): boolean =>
  request.method.toUpperCase() === method.toUpperCase();

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

export const get = Fun.curry(makeRequestMatcher, 'GET');
export const post = Fun.curry(makeRequestMatcher, 'POST');
export const put = Fun.curry(makeRequestMatcher, 'PUT');
export const del = Fun.curry(makeRequestMatcher, 'DELETE');
export const patch = Fun.curry(makeRequestMatcher, 'PATCH');
