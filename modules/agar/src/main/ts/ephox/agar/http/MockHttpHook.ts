import { after, before } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';

import * as MockClient from './MockClient';
import * as RequestHandler from './RequestHandler';

export interface MockHttpHook<T> {
  readonly state: Singleton.Value<T>;
}

export interface MockHttpHookConfig {
  readonly logLevel?: 'debug' | 'info';
  readonly name?: string;
}

export const mockHttpHook = <T>(
  handlers: (state: Singleton.Value<T>) => RequestHandler.RequestMatcher[],
  config?: MockHttpHookConfig
): MockHttpHook<T> => {
  const state = Singleton.value<T>();

  before(async function () {
    if (!window.isSecureContext) {
      this.skip();
    }

    const requestHandlers = handlers(state);

    await MockClient.startMocking({
      ...config,
      handler: async (request) => {
        return RequestHandler.findRequestHandler(requestHandlers, request)
          .getOrThunk(() => Promise.reject(new Error(`No handler found for ${request.method} ${request.url}`)));
      }
    });
  });

  after(async () => {
    await MockClient.stopMocking();
  });

  return {
    state
  };
};
