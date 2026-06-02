import { Optional } from '@ephox/katamari';
import { PathPattern } from '@ephox/polaris';

export interface FetchSpyOptions {
  readonly onFetch?: (request: Request) => void;
  readonly onAbort?: (request: Request) => void;
}

const matchMethod = (request: Request, method: string): boolean =>
  request.method.toUpperCase() === method.toUpperCase();

const makeRequestMatcher = (method: string) =>
  (pattern: string) => {
    const pathMatcher = PathPattern.makePathMatcher(pattern);
    return (request: Request) => {
      if (matchMethod(request, method)) {
        const url = new URL(request.url);
        return pathMatcher(url.pathname);
      } else {
        return Optional.none();
      }
    };
  };

const pWithFetchSpy = async <T>(
  options: FetchSpyOptions,
  callback: () => T | Promise<T>
): Promise<T> => {
  const originalFetch = window.fetch;

  window.fetch = (input, init) => {
    const request = new window.Request(input, init);
    options.onFetch?.(request);

    request.signal.addEventListener('abort', () => options.onAbort?.(request), { once: true });

    return originalFetch.call(window, input, init);
  };

  try {
    return await callback();
  } finally {
    window.fetch = originalFetch;
  }
};

const matchGet = makeRequestMatcher('GET');
const matchPost = makeRequestMatcher('POST');
const matchPut = makeRequestMatcher('PUT');
const matchDel = makeRequestMatcher('DELETE');
const matchPatch = makeRequestMatcher('PATCH');

export {
  matchGet,
  matchPost,
  matchPut,
  matchDel,
  matchPatch,
  pWithFetchSpy
};
