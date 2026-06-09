import { Assert, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import * as FetchSpy from 'ephox/agar/api/FetchSpy';
import * as Http from 'ephox/agar/api/Http';
import * as RequestFilter from 'ephox/agar/api/RequestFilter';
import { TestStore } from 'ephox/agar/api/TestStore';

describe('browser.agar.http.FetchSpyTest', () => {
  const store = TestStore<string>();

  Http.mockHttpHook(() => [
    Http.get('/custom/test', async () => Http.makeResponse('{}', { status: 200, headers: { 'Content-Type': 'application/json' }})),
    Http.post('/custom/test', async () => Http.makeResponse('{}', { status: 200, headers: { 'Content-Type': 'application/json' }})),
    Http.put('/custom/test', async () => Http.makeResponse('{}', { status: 200, headers: { 'Content-Type': 'application/json' }})),
    Http.del('/custom/test', async () => Http.makeResponse('{}', { status: 200, headers: { 'Content-Type': 'application/json' }})),
    Http.patch('/custom/test', async () => Http.makeResponse('{}', { status: 200, headers: { 'Content-Type': 'application/json' }}))
  ]);

  beforeEach(() => {
    store.clear();
  });

  it('TINY-14123: onFetch fires for each request', async () => {
    const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ];

    await FetchSpy.pWithFetchSpy({
      filter: Fun.always,
      onFetch: (request) => store.add(`${request.method} ${new URL(request.url).pathname}`)
    }, async () => {
      for (const method of methods) {
        await window.fetch('/custom/test', { method });
      }
    });

    store.assertEq('All fetches should be observed in order', [
      'GET /custom/test',
      'POST /custom/test',
      'PUT /custom/test',
      'DELETE /custom/test',
      'PATCH /custom/test'
    ]);
  });

  it('TINY-14123: onAbort fires when a request is aborted', async () => {
    const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ];

    await FetchSpy.pWithFetchSpy({
      filter: Fun.always,
      onFetch: (request) => store.add(`fetched ${request.method}`),
      onAbort: (request) => store.add(`aborted ${request.method}`)
    }, async () => {

      for (const method of methods) {
        let thrown: Error | undefined;
        const controller = new window.AbortController();
        const pending = window.fetch('/custom/test', { method, signal: controller.signal });
        controller.abort();

        try {
          await pending;
        } catch (error) {
          thrown = error;
        }

        Assert.eq(
          `Aborted ${method} fetch should reject with an AbortError`,
          'AbortError',
          thrown?.name
        );
      }
    });

    store.assertEq('Spy should observe both fetch and abort for every method', [
      'fetched GET', 'aborted GET',
      'fetched POST', 'aborted POST',
      'fetched PUT', 'aborted PUT',
      'fetched DELETE', 'aborted DELETE',
      'fetched PATCH', 'aborted PATCH'
    ]);
  });

  it('TINY-14123: Only requests matching filter should be spied on', async () => {
    await FetchSpy.pWithFetchSpy({
      filter: RequestFilter.patch('/custom/test'),
      onFetch: (request) => store.add(`fetched ${request.method}`),
      onAbort: (request) => store.add(`aborted ${request.method}`)
    }, async () => {

      const getController = new window.AbortController();
      const pendingGet = window.fetch('/custom/test', { method: 'GET', signal: getController.signal });
      let getThrown: Error | undefined;
      getController.abort();

      try {
        await pendingGet;
      } catch (error) {
        getThrown = error;
      }

      Assert.eq(
        `Aborted get fetch should reject with an AbortError`,
        'AbortError',
        getThrown?.name
      );

      const patchController = new window.AbortController();
      const pendingPatch = window.fetch('/custom/test', { method: 'PATCH', signal: patchController.signal });
      let patchThrown: Error | undefined;
      patchController.abort();

      try {
        await pendingPatch;
      } catch (error) {
        patchThrown = error;
      }

      Assert.eq(
        `Aborted patch fetch should reject with an AbortError`,
        'AbortError',
        patchThrown?.name
      );
    });

    store.assertEq('Spy should only observe PATCH requests', [
      'fetched PATCH', 'aborted PATCH',
    ]);
  });

  it('TINY-14123: Abort should not be emitted, if abort controller fires after request finished executing', async () => {
    await FetchSpy.pWithFetchSpy({
      filter: Fun.always,
      onFetch: (request) => store.add(`fetched ${request.method}`),
      onAbort: (request) => store.add(`aborted ${request.method}`)
    }, async () => {
      const controller = new window.AbortController();
      await window.fetch('/custom/test', { signal: controller.signal });
      controller.abort();

      store.assertEq('Spy should not observe abort, after request resolved', [ 'fetched GET' ]);
    });
  });

  it('TINY-14123: restores window.fetch after callback resolves', async () => {
    const originalFetch = window.fetch;

    await FetchSpy.pWithFetchSpy({ filter: Fun.always }, async () => {
      Assert.eq('fetch should be replaced inside callback', true, window.fetch !== originalFetch);
    });

    Assert.eq('fetch should be restored after callback resolves', true, window.fetch === originalFetch);
  });

  it('TINY-14123: restores window.fetch after callback throws', async () => {
    const originalFetch = window.fetch;
    let thrown: unknown;

    try {
      await FetchSpy.pWithFetchSpy({ filter: Fun.always }, async () => {
        throw new Error('boom');
      });
    } catch (e) {
      thrown = e;
    }

    Assert.eq('error should propagate', true, thrown instanceof Error);
    Assert.eq('fetch should be restored after callback throws', true, window.fetch === originalFetch);
  });
});
