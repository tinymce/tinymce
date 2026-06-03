export interface FetchSpyOptions {
  readonly onFetch?: (request: Request) => void;
  readonly onAbort?: (request: Request) => void;
}

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

export {
  pWithFetchSpy
};
