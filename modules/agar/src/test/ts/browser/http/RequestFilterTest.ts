import { Assert, describe, it } from '@ephox/bedrock-client';

import * as RequestFilter from 'ephox/agar/http/RequestFilter';

describe('browser.agar.http.RequestFilterTest', () => {
  const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ] as const;
  type HttpMethod = typeof methods[number];
  const makeRequest = (method: HttpMethod, url: string): Request => new window.Request(url, { method });

  describe('makeRequestFilter', () => {
    it('TINY-14495: matches regardless of the case used for the filter method', () => {
      const request = makeRequest('GET', '/users');
      const upperFilter = RequestFilter.makeRequestFilter('GET', '/users');
      const lowerFilter = RequestFilter.makeRequestFilter('get', '/users');
      Assert.eq('An uppercase filter should match a GET request', true, upperFilter(request));
      Assert.eq('A lowercase filter should match a GET request', true, lowerFilter(request));
    });

    it('TINY-14495: returns false when the method does not match (path would otherwise match)', () => {
      const filter = RequestFilter.makeRequestFilter('GET', '/users');
      Assert.eq('A POST request should not match a GET filter', false, filter(makeRequest('POST', '/users')));
    });

    it('TINY-14495: returns false when the method matches but the path does not', () => {
      const filter = RequestFilter.makeRequestFilter('GET', '/users/:id');
      Assert.eq('Path mismatch should cause false even on a method match', false, filter(makeRequest('GET', '/posts/42')));
    });

    it('TINY-14495: matches against url.pathname, ignores query params', () => {
      const filter = RequestFilter.makeRequestFilter('GET', '/users/:id');
      const request = makeRequest('GET', '/users/42?foo=bar#frag');
      Assert.eq('Path with query params should match', true, filter(request));
    });

    it('TINY-14495: matches against url.pathname, ignores domain', () => {
      const filter = RequestFilter.makeRequestFilter('GET', '/users/:id');

      const tinyCloudRequest = makeRequest('GET', 'https://tiny.cloud/users/55');
      Assert.eq('Path with tiny.cloud domain should match', true, filter(tinyCloudRequest));

      const tinyDevRequest = makeRequest('GET', 'https://tiny.dev/users/55');
      Assert.eq('Path with tiny.dev domain should match', true, filter(tinyDevRequest));
    });

    it('TINY-14495: pattern should only include path, not full url', () => {
      const filter = RequestFilter.makeRequestFilter('GET', 'https://tiny.cloud/users/:id');
      const request = makeRequest('GET', 'https://tiny.cloud/users/55');

      Assert.eq('Pattern defined with full url should always fail', false, filter(request));
    });
  });

  describe('curried per-method helpers', () => {
    const assertHelperMatchesOnly = (
      helper: (pattern: string) => (request: Request) => boolean,
      expectedMethod: HttpMethod
    ): void => {
      const filter = helper('/path');

      for (const method of methods) {
        const request = makeRequest(method, '/path');
        const result = filter(request);

        if (method === expectedMethod) {
          Assert.eq(`${expectedMethod} helper should match a ${method} request`, true, result);
        } else {
          Assert.eq(`${expectedMethod} helper should not match a ${method} request`, false, result);
        }
      }
    };

    it('TINY-14495: get matches GET requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestFilter.get, 'GET');
    });

    it('TINY-14495: post matches POST requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestFilter.post, 'POST');
    });

    it('TINY-14495: put matches PUT requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestFilter.put, 'PUT');
    });

    it('TINY-14495: del matches DELETE requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestFilter.del, 'DELETE');
    });

    it('TINY-14495: patch matches PATCH requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestFilter.patch, 'PATCH');
    });
  });
});
