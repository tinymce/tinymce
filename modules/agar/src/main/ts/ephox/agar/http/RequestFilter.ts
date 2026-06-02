import { Fun } from '@ephox/katamari';

import * as RequestMatcher from './RequestMatcher';

export const makeRequestFilter = (method: string, pattern: string) => {
  const matcher = RequestMatcher.makeRequestMatcher(method, pattern);
  return (request: Request): boolean => matcher(request).isSome();
};

export const get = Fun.curry(makeRequestFilter, 'GET');
export const post = Fun.curry(makeRequestFilter, 'POST');
export const put = Fun.curry(makeRequestFilter, 'PUT');
export const del = Fun.curry(makeRequestFilter, 'DELETE');
export const patch = Fun.curry(makeRequestFilter, 'PATCH');
