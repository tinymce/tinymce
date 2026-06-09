import { Assert, describe, it } from '@ephox/bedrock-client';
import type { Optional } from '@ephox/katamari';

import * as RequestMatcher from 'ephox/agar/http/RequestMatcher';

describe('browser.agar.http.RequestMatcherTest', () => {
  const methods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ] as const;
  type HttpMethod = typeof methods[number];
  const makeRequest = (method: HttpMethod, url: string): Request => new window.Request(url, { method });

  describe('makeRequestMatcher', () => {
    it('TINY-14495: matches regardless of the case used for the matcher method', () => {
      const request = makeRequest('GET', '/users');
      const upperMatcher = RequestMatcher.makeRequestMatcher('GET', '/users');
      const lowerMatcher = RequestMatcher.makeRequestMatcher('get', '/users');
      Assert.eq('An uppercase matcher should match a GET request', true, upperMatcher(request).isSome());
      Assert.eq('A lowercase matcher should match a GET request', true, lowerMatcher(request).isSome());
    });

    it('TINY-14495: returns none when the method does not match (path would otherwise match)', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users');
      Assert.eq('A POST request should not match a GET matcher', true, matcher(makeRequest('POST', '/users')).isNone());
    });

    it('TINY-14495: returns none when the method matches but the path does not', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users/:id');
      Assert.eq('Path mismatch should cause none even on a method match', true, matcher(makeRequest('GET', '/posts/42')).isNone());
    });

    it('TINY-14495: matches against url.pathname, ignores query params', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users/:id');
      const request = makeRequest('GET', '/users/42?foo=bar#frag');
      const result = matcher(request);
      Assert.eq('Path with query params should match', true, result.isSome());
    });

    it('TINY-14495: matches against url.pathname, ignores domain', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users/:id');

      const tinyCloudRequest = makeRequest('GET', 'https://tiny.cloud/users/55');
      Assert.eq('Path with tiny.cloud domain should match', true, matcher(tinyCloudRequest).isSome());

      const tinyDevRequest = makeRequest('GET', 'https://tiny.dev/users/55');
      Assert.eq('Path with tiny.dev domain should match', true, matcher(tinyDevRequest).isSome());
    });

    it('TINY-14495: returns matched params', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users/:userId/conversations/:conversationId');
      const request = makeRequest('GET', '/users/33/conversations/123');
      const result = matcher(request);

      Assert.eq('Path should match', true, result.isSome());
      Assert.eq('Path parameters should be returned properly', { userId: '33', conversationId: '123' }, result.getOrDie());
    });

    it('TINY-14495: pattern should only include path, not full url', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', 'https://tiny.cloud/users/:id');
      const request = makeRequest('GET', 'https://tiny.cloud/users/55');

      Assert.eq('Pattern defined with full url should always fail', false, matcher(request).isSome());
    });
  });

  describe('per-method helpers', () => {
    const assertHelperMatchesOnly = (
      helper: (pattern: string) => (request: Request) => Optional<Record<string, string>>,
      expectedMethod: HttpMethod
    ): void => {
      const matcher = helper('/path');

      for (const method of methods) {
        const request = makeRequest(method, '/path');
        const result = matcher(request);

        if (method === expectedMethod) {
          Assert.eq(`${expectedMethod} helper should match a ${method} request`, true, result.isSome());
        } else {
          Assert.eq(`${expectedMethod} helper should not match a ${method} request`, false, result.isSome());
        }
      }
    };

    it('TINY-14495: get matches GET requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestMatcher.get, 'GET');
    });

    it('TINY-14495: post matches POST requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestMatcher.post, 'POST');
    });

    it('TINY-14495: put matches PUT requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestMatcher.put, 'PUT');
    });

    it('TINY-14495: del matches DELETE requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestMatcher.del, 'DELETE');
    });

    it('TINY-14495: patch matches PATCH requests and rejects every other method', () => {
      assertHelperMatchesOnly(RequestMatcher.patch, 'PATCH');
    });
  });
});
