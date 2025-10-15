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
