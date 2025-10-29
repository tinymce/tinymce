export const makeResponse = (body: BodyInit | null, init: ResponseInit): Response => new window.Response(body, init);

export const jsonResponse = (data: any, init: ResponseInit = {}): Response =>
  makeResponse(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

export const textResponse = (data: string, init: ResponseInit = {}): Response =>
  makeResponse(data, {
    ...init,
    headers: {
      'Content-Type': 'text/plain',
      ...(init.headers ?? {}),
    },
  });

export const blobResponse = (data: Blob, init: ResponseInit = {}): Response =>
  makeResponse(data, {
    ...init,
    headers: {
      'Content-Type': data.type,
      ...(init.headers ?? {}),
    },
  });

export const chunkedResponse = (data: AsyncIterable<string>, init: ResponseInit = {}): Response => {
  const encoder = new window.TextEncoder();
  const stream = new window.ReadableStream({
    start: async (controller) => {
      for await (const chunk of data) {
        controller.enqueue(encoder.encode(chunk));
      }

      controller.close();
    }
  });

  return makeResponse(stream, {
    ...init,
    headers: {
      'Content-Type': 'text/plain',
      'Transfer-Encoding': 'chunked',
      ...(init.headers ?? {}),
    },
  });
};
