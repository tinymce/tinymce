import { describe, it, Assert } from '@ephox/bedrock-client';
import { Type } from '@ephox/katamari';

import * as Http from 'ephox/agar/api/Http';

interface State {
  readonly count: number;
}

const pWait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('browser.agar.http.HttpMockingTest', () => {
  const httpHook = Http.mockHttpHook<State>((state) => [
    Http.get('/custom/test', async () => {
      return Http.makeResponse(
        JSON.stringify({ message: 'Get response' }),
        {
          status: 200,
          statusText: 'OK',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }),
    Http.post('/custom/test', async ({ request }) => {
      const body = await request.json();

      return Http.makeResponse(
        JSON.stringify({ received: body }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }),
    Http.put('/custom/test', async () => {
      return Http.makeResponse(
        JSON.stringify({ message: 'Put response' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }),
    Http.del('/custom/test', async () => {
      return Http.makeResponse(
        JSON.stringify({ message: 'Delete response' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }),
    Http.patch('/custom/test', async () => {
      return Http.makeResponse(
        JSON.stringify({ message: 'Patch response' }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }),
    Http.get('/custom/test/status/:status', async ({ params }) => {
      const status = parseInt(params.status, 10);

      return Http.makeResponse(
        JSON.stringify({ message: 'Not found' }),
        {
          status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }),
    Http.get('/custom/test/splat/*', async ({ params }) => {
      return Http.makeResponse(
        JSON.stringify({ message: params.splat0 }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }),
    Http.get('/custom/test/state', async () => {
      const currentState = state.get().getOr({ count: 0 });
      state.set({ count: currentState.count + 1 });

      return Http.makeResponse(
        JSON.stringify({ count: state.get().getOr({ count: 0 }).count }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }),
    Http.get('/custom/streaming', async () => {
      const getChunks = async function* () {
        const items = [ 'one', 'two', 'three' ];

        for (const item of items) {
          yield item;
          await pWait(1);
        }
      };

      return Http.chunkedResponse(getChunks());
    }),
    Http.post('/custom/upload', async ({ request }) => {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      const value = formData.get('field') as string;

      return Http.jsonResponse({
        file: {
          name: file.name,
          type: file.type,
          size: file.size
        },
        field: value
      });
    })
  ], { logLevel: 'info', name: 'test' });

  it('TINY-13084: Should mock simple GET request', async () => {
    const response = await window.fetch('/custom/test');
    const json = await response.json();

    Assert.eq('Should be expected JSON response', { message: 'Get response' }, json);
    Assert.eq('Should be expected status', 200, response.status);
    Assert.eq('Should be expected statusText', 'OK', response.statusText);
    Assert.eq('Should be expected content-type', 'application/json', response.headers.get('Content-Type'));
  });

  it('TINY-13084: Should mock simple POST request', async () => {
    const response = await window.fetch('/custom/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'John Doe'
      }),
    });
    const json = await response.json();

    Assert.eq('Should be expected JSON response', { received: { name: 'John Doe' }}, json);
    Assert.eq('Should be expected status', 200, response.status);
    Assert.eq('Should be expected content-type', 'application/json', response.headers.get('Content-Type'));
  });

  it('TINY-13084: Should mock simple PUT request', async () => {
    const response = await window.fetch('/custom/test', {
      method: 'PUT',
    });
    const json = await response.json();

    Assert.eq('Should be expected JSON response', { message: 'Put response' }, json);
    Assert.eq('Should be expected status', 200, response.status);
    Assert.eq('Should be expected content-type', 'application/json', response.headers.get('Content-Type'));
  });

  it('TINY-13084: Should mock simple DELETE request', async () => {
    const response = await window.fetch('/custom/test', {
      method: 'DELETE',
    });
    const json = await response.json();

    Assert.eq('Should be expected JSON response', { message: 'Delete response' }, json);
    Assert.eq('Should be expected status', 200, response.status);
    Assert.eq('Should be expected content-type', 'application/json', response.headers.get('Content-Type'));
  });

  it('TINY-13084: Should mock simple PATCH request', async () => {
    const response = await window.fetch('/custom/test', {
      method: 'PATCH',
    });
    const json = await response.json();

    Assert.eq('Should be expected JSON response', { message: 'Patch response' }, json);
    Assert.eq('Should be expected status', 200, response.status);
    Assert.eq('Should be expected content-type', 'application/json', response.headers.get('Content-Type'));
  });

  it('TINY-13084: Should return custom http status 403', async () => {
    const { status } = await window.fetch('/custom/test/status/404');
    Assert.eq('Should be expected status', 404, status);
  });

  it('TINY-13084: Should return custom http status 404', async () => {
    const { status } = await window.fetch('/custom/test/status/404');
    Assert.eq('Should be expected status', 404, status);
  });

  it('TINY-13084: Should return splat path', async () => {
    const json = await window.fetch('/custom/test/splat/a/b/c').then((res) => res.json());
    Assert.eq('Should be expected status', { message: 'a/b/c' }, json);
  });

  it('TINY-13084: Should update state', async () => {
    httpHook.state.clear();

    const json1 = await window.fetch('/custom/test/state').then((res) => res.json());
    Assert.eq('Should be expected state', { count: 1 }, json1);

    const json2 = await window.fetch('/custom/test/state').then((res) => res.json());
    Assert.eq('Should be expected state', { count: 2 }, json2);
  });

  it('TINY-13084: Should handle streaming response', async () => {
    const response = await window.fetch('/custom/streaming');
    const body = response.body;

    if (Type.isNull(body)) {
      Assert.fail('Response body should not be null');
      return;
    }

    Assert.eq('Should be expected content-type', 'text/plain', response.headers.get('Content-Type'));
    Assert.eq('Should be expected transfer-encoding', 'chunked', response.headers.get('Transfer-Encoding'));

    const reader = body.pipeThrough<string>(new window.TextDecoderStream()).getReader();
    const chunks: string[] = [];

    while (true) {
      const { done, value: chunk } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(chunk);
    }

    Assert.eq('Should be expected chunks', [ 'one', 'two', 'three' ], chunks);
  });

  it('TINY-13084: Should handle file uploads', async () => {
    const formData = new FormData();

    formData.append('field', 'value');
    formData.append('file', new Blob([ 'file contents' ], { type: 'text/plain' }), 'test.txt');

    const response = await window.fetch('/custom/upload', {
      method: 'POST',
      body: formData
    });
    const json = await response.json();

    Assert.eq('Should be expected JSON response', {
      file: {
        name: 'test.txt',
        type: 'text/plain',
        size: 13
      },
      field: 'value'
    }, json);
    Assert.eq('Should be expected status', 200, response.status);
    Assert.eq('Should be expected content-type', 'application/json', response.headers.get('Content-Type'));
  });
});
