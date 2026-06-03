import { Assert, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';

import * as RequestMatcher from 'ephox/agar/http/RequestMatcher';

describe('browser.agar.http.RequestMatcherTest', () => {
  const mkReq = (method: string, url: string): Request => new window.Request(url, { method });

  const allMethods = [ 'GET', 'POST', 'PUT', 'DELETE', 'PATCH' ];

  describe('makeRequestMatcher', () => {
    it('TINY-14123: matches when the request method case differs from the matcher method', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users');
      Assert.eq('Lowercase request method should match an uppercase matcher', true, matcher(mkReq('get', 'https://example.com/users')).isSome());
    });

    it('TINY-14123: matches when the matcher method case differs from the request method', () => {
      const matcher = RequestMatcher.makeRequestMatcher('get', '/users');
      Assert.eq('Uppercase request method should match a lowercase matcher', true, matcher(mkReq('GET', 'https://example.com/users')).isSome());
    });

    it('TINY-14123: returns none when the method does not match (path would otherwise match)', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users');
      Assert.eq('A POST request should not match a GET matcher', true, matcher(mkReq('POST', 'https://example.com/users')).isNone());
    });

    it('TINY-14123: matches against url.pathname only and passes path params through', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users/:id');
      const result = matcher(mkReq('GET', 'https://example.com/users/42?foo=bar#frag'));
      Assert.eq('Pathname-only match should yield the expected params', { id: '42' }, result.getOrDie('Expected the matcher to return some params'));
    });

    it('TINY-14123: returns none when the method matches but the path does not', () => {
      const matcher = RequestMatcher.makeRequestMatcher('GET', '/users/:id');
      Assert.eq('Path mismatch should yield none even on a method match', true, matcher(mkReq('GET', 'https://example.com/posts/42')).isNone());
    });
  });

  describe('curried per-method helpers', () => {
    const helpers: ReadonlyArray<{ readonly name: string; readonly method: string; readonly helper: (pattern: string) => (request: Request) => ReturnType<ReturnType<typeof RequestMatcher.makeRequestMatcher>> }> = [
      { name: 'get', method: 'GET', helper: RequestMatcher.get },
      { name: 'post', method: 'POST', helper: RequestMatcher.post },
      { name: 'put', method: 'PUT', helper: RequestMatcher.put },
      { name: 'del', method: 'DELETE', helper: RequestMatcher.del },
      { name: 'patch', method: 'PATCH', helper: RequestMatcher.patch }
    ];

    Arr.each(helpers, ({ name, method, helper }) => {
      it(`TINY-14123: ${name} matches ${method} requests and rejects every other method`, () => {
        const matcher = helper('/path');
        Arr.each(allMethods, (candidate) => {
          const result = matcher(mkReq(candidate, 'https://example.com/path'));
          if (candidate === method) {
            Assert.eq(`${name} should match a ${candidate} request`, true, result.isSome());
          } else {
            Assert.eq(`${name} should not match a ${candidate} request`, true, result.isNone());
          }
        });
      });
    });
  });
});
