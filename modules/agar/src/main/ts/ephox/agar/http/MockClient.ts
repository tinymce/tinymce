import { Type } from '@ephox/katamari';

import * as HttpHandler from './HttpHandler';
import * as Shared from './Shared';

export interface MockingConfig {
  readonly handler: HttpHandler.RawRequestHandler;
  readonly serviceWorkerUrl?: string;
  readonly name?: string;
  readonly logLevel?: Shared.LogLevel;
}

let mockingEnabled = false;
const inflightRequests = new Map<string, Promise<void>>();

const defaultConfig: Required<MockingConfig> = {
  name: '',
  serviceWorkerUrl: '/agar-sw.js',
  handler: HttpHandler.defaultHandler,
  logLevel: 'info'
};

let currentMockingConfig = { ...defaultConfig };

const getPrefix = () => {
  const { name } = currentMockingConfig;
  return name !== '' ? `[AGAR-CLIENT][${name}]` : '[AGAR-CLIENT]';
};

const log = (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.log(getPrefix(), ...args);
};

const debugLog = (...args: any[]) => {
  if (currentMockingConfig.logLevel === 'debug') {
    log(...args);
  }
};

const infoLog = (...args: any[]) => {
  const { logLevel } = currentMockingConfig;
  if (logLevel === 'info' || logLevel === 'debug') {
    log(...args);
  }
};

const errorLog = (...args: any[]) => {
  // eslint-disable-next-line no-console
  console.error(getPrefix(), ...args);
};

const sendResponseDone = (port: MessagePort) => {
  const bodyDoneMessage: Shared.MockedResponseBodyDoneMessage = {
    type: 'AGAR_MOCKED_RESPONSE_BODY_DONE'
  };

  debugLog('Responding with mocked response body chunk to SW:', bodyDoneMessage);
  port.postMessage(bodyDoneMessage);
};

const closePort = (port: MessagePort) => {
  port.onmessage = null;
  port.close();
};

const handleBodyResponse = async (body: ReadableStream<Uint8Array>, port: MessagePort, abortController: AbortController) => {
  return new Promise<void>((resolve, reject) => {
    const reader = body.getReader();
    let aborted = false;

    const closeResolve = () => {
      closePort(port);
      resolve();
    };

    const closeReject = (err: unknown) => {
      reader.releaseLock();
      closePort(port);
      reject(err);
    };

    port.onmessage = (event) => {
      const message = event.data;

      if (Shared.isMockedRequestResponseChunkMessage(message)) {
        debugLog('Responding with mocked response body chunk to SW: request chunk received', message);

        reader.read().then(({ value: chunk, done }) => {
          if (aborted) {
            return;
          }

          if (!done) {
            const buffer = chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
            const bodyChunkMessage: Shared.MockedResponseBodyChunkMessage = {
              type: 'AGAR_MOCKED_RESPONSE_BODY_CHUNK',
              buffer
            };

            debugLog('Responding with mocked response body chunk to SW:', bodyChunkMessage);
            port.postMessage(bodyChunkMessage);
          } else {
            sendResponseDone(port);
            closeResolve();
          }
        }, (err) => {
          errorLog('Error reading response body chunk for request:', message, err);
          closeReject(err);
        });
      } else if (Shared.isMockedRequestAbortedMessage(message)) {
        aborted = true;
        debugLog('Request aborted by SW:', message);

        reader.cancel().then(() => {
          debugLog('Reader cancelled for aborted request:', message);
          closeResolve();
        }, (err) => {
          errorLog('Error cancelling reader for aborted request:', message, err);
          closeReject(err);
        }).finally(() => {
          abortController.abort();
        });
      } else {
        aborted = true;
        errorLog('Unexpected message received on port for body response handling:', message);
        closeReject(new Error('Unexpected message received on port for body response handling'));
      }
    };
  });
};

const handleNonBodyResponse = async (port: MessagePort, abortController: AbortController) => {
  return new Promise<void>((resolve, reject) => {
    port.onmessage = (event) => {
      const message = event.data;

      if (Shared.isMockedRequestResponseChunkMessage(message)) {
        sendResponseDone(port);
        closePort(port);
        resolve();
      } else if (Shared.isMockedRequestAbortedMessage(message)) {
        abortController.abort();
        debugLog('Request without body aborted by SW:', message);
        closePort(port);
        resolve();
      } else {
        closePort(port);
        reject(new Error('Unexpected message received on port for non-body response handling'));
      }
    };
  });
};

const messageHandler = (event: MessageEvent) => {
  const port = event.ports[0];
  const data = event.data;

  if (Shared.isMockRequestMessage(data)) {
    const handler = currentMockingConfig.handler;
    const abortController = new window.AbortController();

    const url = new URL(data.url);
    const request = new window.Request(url, {
      method: data.method,
      headers: data.headers,
      body: data.body.byteLength > 0 ? data.body : undefined,
    });

    const requestPromise = handler(request, abortController.signal).then(async (response) => {
      infoLog(`[${data.method}] ${data.url} -> ${response.status} ${response.statusText}`);

      const headMessage: Shared.MockedResponseHeadMessage = {
        type: 'AGAR_MOCKED_RESPONSE_HEAD',
        requestId: data.requestId,
        status: response.status,
        statusText: response.statusText,
        headers: Shared.getHeaders(response.headers),
      };
      debugLog('Responding with mocked response head to SW:', headMessage);
      port.postMessage(headMessage);

      if (Type.isNonNullable(response.body)) {
        await handleBodyResponse(response.body, port, abortController);
      } else {
        await handleNonBodyResponse(port, abortController);
      }
    }).finally(() => {
      inflightRequests.delete(data.requestId);
    });

    inflightRequests.set(data.requestId, requestPromise);
  }
};

const waitForControllerChange = (): Promise<void> => new Promise((resolve) => {
  navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), { once: true });
});

const registerServiceWorker = async (swUrl: string): Promise<void> => {
  const registration = await navigator.serviceWorker.register(swUrl, { scope: '/' });
  debugLog('Service worker registered:', registration);

  if (Type.isNullable(navigator.serviceWorker.controller)) {
    await waitForControllerChange();
  }

  await navigator.serviceWorker.ready;
};

const sendMessageToServiceWorker = async (
  message: Shared.MockingStartMessage | Shared.MockingStopMessage
): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const controller = navigator.serviceWorker.controller;

    if (controller) {
      const messageChannel = new window.MessageChannel();

      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      controller.postMessage(message, [ messageChannel.port2 ]);
    } else {
      reject(new Error('No active service worker controller found.'));
    }
  });
};

export const startMocking = async (mockingConfig: MockingConfig): Promise<void> => {
  const defaultedConfig = { ...defaultConfig, ...mockingConfig };

  if (mockingEnabled) {
    return;
  }

  await registerServiceWorker(defaultedConfig.serviceWorkerUrl);

  currentMockingConfig = defaultedConfig;

  const message = await sendMessageToServiceWorker({ type: 'AGAR_MOCKING_START', logLevel: defaultedConfig.logLevel });
  if (Shared.isMockingStartedMessage(message)) {
    navigator.serviceWorker.addEventListener('message', messageHandler);
    mockingEnabled = true;
    infoLog('Mocking enabled');
  } else {
    throw new Error('Failed to start mocking. Unexpected response from service worker.');
  }
};

export const stopMocking = async (): Promise<void> => {
  if (!mockingEnabled) {
    return;
  }

  const message = await sendMessageToServiceWorker({ type: 'AGAR_MOCKING_STOP' });
  if (Shared.isMockingStoppedMessage(message)) {
    navigator.serviceWorker.removeEventListener('message', messageHandler);
    mockingEnabled = false;
    await Promise.allSettled(inflightRequests.values());
    infoLog('Mocking disabled');
  } else {
    throw new Error('Failed to stop mocking. Unexpected response from service worker.');
  }
};
