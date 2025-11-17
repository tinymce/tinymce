import { after, before } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';

import * as HttpHandler from './HttpHandler';
import * as MockClient from './MockClient';
import type * as Shared from './Shared';

export interface MockHttpHook<T> {
  readonly state: Singleton.Value<T>;
}

export interface MockHttpHookConfig {
  readonly logLevel?: Shared.LogLevel;
  readonly name?: string;
}

export const mockHttpHook = <T>(
  handlers: (state: Singleton.Value<T>) => HttpHandler.HttpHandler[],
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
      handler: (request, abortSignal) => HttpHandler.resolveRequest(requestHandlers, request, abortSignal)
    });
  });

  after(async () => {
    await MockClient.stopMocking();
  });

  return {
    state
  };
};
