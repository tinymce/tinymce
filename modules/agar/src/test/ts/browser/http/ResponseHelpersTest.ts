import { Assert, describe, it } from '@ephox/bedrock-client';

import * as ResponseHelpers from 'ephox/agar/http/ResponseHelpers';

describe('browser.agar.http.ResponseHelpersTest', () => {
  it('TINY-13084: blobResponse', async () => {
    const response = ResponseHelpers.blobResponse(new Blob([ 'hello' ], { type: 'text/plain' }));

    Assert.eq('Should have the expected content', 'hello', await response.text());
    Assert.eq('Should have the expected content type', 'text/plain', response.headers.get('Content-Type'));
    Assert.eq('Should have the expected status', 200, response.status);
  });

  it('TINY-13084: blobResponse custom init', async () => {
    const response = ResponseHelpers.blobResponse(new Blob([ 'hello' ], { type: 'text/plain' }), {
      status: 201,
      headers: { 'X-Custom': 'CustomValue' }
    });

    Assert.eq('Should have the expected content', 'hello', await response.text());
    Assert.eq('Should have the expected content type', 'text/plain', response.headers.get('Content-Type'));
    Assert.eq('Should have the expected custom header', 'CustomValue', response.headers.get('X-Custom'));
    Assert.eq('Should have the expected status', 201, response.status);
  });

  it('TINY-13084: jsonResponse', async () => {
    const response = ResponseHelpers.jsonResponse({ data: 123 });

    Assert.eq('Should have the expected content', { data: 123 }, await response.json());
    Assert.eq('Should have the expected content type', 'application/json', response.headers.get('Content-Type'));
    Assert.eq('Should have the expected status', 200, response.status);
  });

  it('TINY-13084: textResponse', async () => {
    const response = ResponseHelpers.textResponse('hello world');

    Assert.eq('Should have the expected content', 'hello world', await response.text());
    Assert.eq('Should have the expected content type', 'text/plain', response.headers.get('Content-Type'));
    Assert.eq('Should have the expected status', 200, response.status);
  });

  it('TINY-13084: makeResponse', async () => {
    const response = ResponseHelpers.makeResponse('hello world', { headers: { 'Content-Type': 'text/plain' }});

    Assert.eq('Should have the expected content', 'hello world', await response.text());
    Assert.eq('Should have the expected content type', 'text/plain', response.headers.get('Content-Type'));
    Assert.eq('Should have the expected status', 200, response.status);
  });

  it('TINY-13084: chunkedResponse', async () => {
    const response = ResponseHelpers.chunkedResponse((async function* () {
      yield 'hello';
      yield ' ';
      yield 'world';
    })());

    Assert.eq('Should have the expected content', 'hello world', await response.text());
    Assert.eq('Should have the expected content type', 'text/plain', response.headers.get('Content-Type'));
    Assert.eq('Should have the expected transfer encoding', 'chunked', response.headers.get('Transfer-Encoding'));
    Assert.eq('Should have the expected status', 200, response.status);
  });
});
