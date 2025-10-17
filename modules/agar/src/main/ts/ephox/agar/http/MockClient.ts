import * as HttpHandler from './HttpHandler';
import * as Shared from './Shared';
import * as StreamUtils from './StreamUtils';

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

const log = (...args: any[]) => {
  const { name } = currentMockingConfig;

  if (name !== '') {
    // eslint-disable-next-line no-console
    console.log(`[AGAR-CLIENT][${name}]`, ...args);
  } else {
    // eslint-disable-next-line no-console
    console.log('[AGAR-CLIENT]', ...args);
  }
};

const debugLog = (...args: any[]) => {
  if (currentMockingConfig.logLevel === 'debug') {
    log(...args);
  }
};

const infoLog = (...args: any[]) => {
  if (currentMockingConfig.logLevel === 'info') {
    log(...args);
  }
};

const messageHandler = (event: MessageEvent) => {
  const port = event.ports[0];
  const data = event.data;

  if (Shared.isMockRequestMessage(data)) {
    const handler = currentMockingConfig.handler;

    const url = new URL(data.url);
    const request = new window.Request(url, {
      method: data.method,
      headers: data.headers,
      body: data.body.byteLength > 0 ? data.body : undefined,
    });

    const requestPromise = handler(request).then(async (response) => {
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

      if (response.body) {
        await StreamUtils.forEachChunk(response.body, (chunk) => {
          const bodyChunkMessage: Shared.MockedResponseBodyChunkMessage = {
            type: 'AGAR_MOCKED_RESPONSE_BODY_CHUNK',
            buffer: chunk.buffer
          };

          debugLog('Responding with mocked response body chunk to SW:', bodyChunkMessage);
          port.postMessage(bodyChunkMessage);
        });

        const bodyDoneMessage: Shared.MockedResponseBodyDoneMessage = {
          type: 'AGAR_MOCKED_RESPONSE_BODY_DONE'
        };

        debugLog('Responding with mocked response body chunk to SW:', bodyDoneMessage);
        port.postMessage(bodyDoneMessage);

      } else {
        const bodyDoneMessage: Shared.MockedResponseBodyDoneMessage = {
          type: 'AGAR_MOCKED_RESPONSE_BODY_DONE'
        };

        debugLog('Responding with mocked response body chunk to SW:', bodyDoneMessage);
        port.postMessage(bodyDoneMessage);
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

  if (!navigator.serviceWorker.controller) {
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
