// Needs to be a deep import to a module that doesn't touch the DOM or we get WebWorker/DOM conflicts
// and we also want to ensure that we use the same message contract
import * as Shared from '@ephox/agar/lib/main/ts/ephox/agar/http/Shared';
import { Arr, Optional, Type } from '@ephox/katamari';

declare const self: ServiceWorkerGlobalScope;

const activeClientIds = new Set<string>();

let logLevel = 'debug';
const logPrefix = '[AGAR-SW]:';

const debugLog = (...args: any[]) => {
  if (logLevel === 'debug') {
    // eslint-disable-next-line no-console
    console.log(logPrefix, ...args);
  }
};

const sendMessageToPort = (
  clientId: string,
  port: MessagePort,
  message: Shared.MockingStartedMessage | Shared.MockingStoppedMessage
) => {
  debugLog(`sendMessageToPort: [${message.type}]`, { clientId, message });
  port.postMessage(message);
};

const sendRequestToClient = async (client: Client, request: Request): Promise<Response> => {
  const body = await request.arrayBuffer();
  const requestId = crypto.randomUUID();

  debugLog('sendRequestToClient:', { clientId: client.id, requestId, request });

  return new Promise((resolve, reject) => {
    const messageChannel = new MessageChannel();
    const incomingPort = messageChannel.port1;

    incomingPort.onmessage = ({ data: startData }) => {
      if (Shared.isMockedResponseHeadMessage(startData)) {
        incomingPort.onmessage = (event) => {
          const bodyData = event.data;
          if (Shared.isMockedResponseBodyChunkMessage(bodyData)) {
            debugLog('Returning mocked response', { clientId: client.id, requestId, url: request.url });
            resolve(new Response(bodyData.data, {
              status: startData.status,
              statusText: startData.statusText,
              headers: startData.headers
            }));
          } else {
            reject(new Error('Unexpected message from client expected response body chunk or done.'));
          }
        };
      } else {
        reject(new Error('Unexpected message from client expected response head.'));
      }
    };

    const message: Shared.MockRequestMessage = {
      type: 'AGAR_MOCKED_REQUEST',
      requestId,
      method: request.method,
      url: request.url,
      headers: Shared.getHeaders(request.headers),
      body
    };

    client.postMessage(message, [ messageChannel.port2 ]);
  });
};

const mockErrorResponse = (message: string) => new Response(message, { status: 500 });

// We only handle requests from visible clients since a service worker is shared across all tabs
const isHiddenClient = (client: Client) => client instanceof WindowClient && client.visibilityState === 'hidden';

const findMainClient = async (clientId: string): Promise<Optional<Client>> => {
  const client = await self.clients.get(clientId);

  if (Type.isNonNullable(client) && isHiddenClient(client)) {
    return Optional.none();
  }

  if (Type.isNonNullable(client) && activeClientIds.has(clientId)) {
    return Optional.some(client);
  }

  const windowClients = await self.clients.matchAll({ type: 'window' });

  return Arr.find(windowClients, (wc) => !isHiddenClient(wc) && activeClientIds.has(wc.id));
};

const handleRequest = async (clientId: string, request: Request): Promise<Response> => {
  const clientOpt = await findMainClient(clientId);

  return clientOpt.fold(
    // Couldn't find a client then just passthrough the request
    () => fetch(request),
    async (client) => {
      return sendRequestToClient(client, request).catch((error) => {
        if (error instanceof Error) {
          return mockErrorResponse(error.message);
        } else {
          return mockErrorResponse('Unknown error when handling request.');
        }
      });
    }
  );
};

const isMockingTargetRequest = (pathname: string) => pathname.startsWith(Shared.mockPrefix) && activeClientIds.size > 0;

export const setup = (): void => {
  // Activate the service worker as soon as it's finished installing
  self.addEventListener('install', () => {
    self.skipWaiting().catch((error) => {
      // eslint-disable-next-line no-console
      console.error(logPrefix, error);
    });
  });

  // Claim any clients immediately, so that the page will be under SW control without reloading
  self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener('fetch', (event) => {
    const reqUrl = new URL(event.request.url);

    if (reqUrl.origin !== self.location.origin) {
      return;
    }

    if (isMockingTargetRequest(reqUrl.pathname)) {
      event.respondWith(handleRequest(event.clientId, event.request));
    }
  });

  self.addEventListener('message', (event) => {
    const source = event.source;
    const port = event.ports[0];

    if (source instanceof Client) {
      const clientId = source.id;
      const data = event.data;

      if (Shared.isMockingStartMessage(data)) {
        logLevel = data.logLevel ?? logLevel;
        activeClientIds.add(clientId);
        sendMessageToPort(clientId, port, { type: 'AGAR_MOCKING_STARTED' });
      } else if (Shared.isMockingStopMessage(data)) {
        activeClientIds.delete(clientId);
        sendMessageToPort(clientId, port, { type: 'AGAR_MOCKING_STOPPED' });
      }
    }
  });
};
