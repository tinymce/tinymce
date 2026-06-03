import { Fun, Optional } from '@ephox/katamari';
import { PathPattern } from '@ephox/polaris';

const matchMethod = (request: Request, method: string): boolean =>
  request.method.toUpperCase() === method.toUpperCase();

export const makeRequestMatcher = (method: string, pattern: string) => {
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
