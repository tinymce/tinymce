import { Assert, context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import * as PathPattern from 'ephox/polaris/api/PathPattern';

describe('atomic.polaris.api.PathPatternTest', () => {
  context('makePathMatcher', () => {
    const testPathMatcher = (testCase: { pattern: string; path: string; expected: Optional<Record<string, string>> }) => {
      const matcher = PathPattern.makePathMatcher(testCase.pattern);
      const result = matcher(testCase.path);

      Assert.eq('Should match the specified pattern', testCase.expected, result);
    };

    it('TINY-13051: should match root path', () => testPathMatcher({
      pattern: '/',
      path: '/',
      expected: Optional.some({})
    }));

    it('TINY-13051: should match simple path', () => testPathMatcher({
      pattern: '/a/b/c',
      path: '/a/b/c',
      expected: Optional.some({})
    }));

    it('TINY-13051: should not match simple path since they are different', () => testPathMatcher({
      pattern: '/a/b/c',
      path: '/a/b/x',
      expected: Optional.none()
    }));

    it('TINY-13051: should match path with named parameter', () => testPathMatcher({
      pattern: '/a/:param/c',
      path: '/a/b/c',
      expected: Optional.some({ param: 'b' })
    }));

    it('TINY-13051: should match path with multiple named parameters', () => testPathMatcher({
      pattern: '/:one/:two/:three',
      path: '/a/b/c',
      expected: Optional.some({ one: 'a', two: 'b', three: 'c' })
    }));

    it('TINY-13051: should not match path with named parameter since static parts are different', () => testPathMatcher({
      pattern: '/a/:param/c',
      path: '/x/b/c',
      expected: Optional.none()
    }));

    it('TINY-13051: should not match path with named parameter since there are not enough segments', () => testPathMatcher({
      pattern: '/a/:param/c',
      path: '/a/b',
      expected: Optional.none()
    }));

    it('TINY-13051: should match path with splat parameter', () => testPathMatcher({
      pattern: '/a/*',
      path: '/a/b/c/d',
      expected: Optional.some({ splat0: 'b/c/d' })
    }));

    it('TINY-13051: should match path with multiple splat parameters', () => testPathMatcher({
      pattern: '/*/b/*',
      path: '/a/b/c/d',
      expected: Optional.some({ splat0: 'a', splat1: 'c/d' })
    }));

    it('TINY-13051: should match path with named and splat parameters', () => testPathMatcher({
      pattern: '/a/:param/*',
      path: '/a/b/c/d',
      expected: Optional.some({ param: 'b', splat0: 'c/d' })
    }));

    it('TINY-13051: should match path with splat parameter at start', () => testPathMatcher({
      pattern: '/*/b/c',
      path: '/a/b/c',
      expected: Optional.some({ splat0: 'a' })
    }));

    it('TINY-13051: should match path with splat parameter at end', () => testPathMatcher({
      pattern: '/a/b/*',
      path: '/a/b/c/d/e',
      expected: Optional.some({ splat0: 'c/d/e' })
    }));

    it('TINY-13051: should match path with splat parameter and trailing slash', () => testPathMatcher({
      pattern: '/a/b/*',
      path: '/a/b/',
      expected: Optional.some({ splat0: '' })
    }));

    it('TINY-13051: should throw error on invalid named parmeters', () => {
      try {
        PathPattern.makePathMatcher('/a/:!nvalid/c');
        Assert.fail('Expected makePathMatcher to throw an error');
      } catch (error) {
        if (error instanceof Error) {
          Assert.eq('Error message should be correct', 'Invalid param name "!nvalid" in pattern "/a/:!nvalid/c"', error.message);
        }
      }
    });

    it('TINY-13051: should throw error for non star only splats', () => {
      try {
        PathPattern.makePathMatcher('/a/*foo/c');
        Assert.fail('Expected makePathMatcher to throw an error');
      } catch (error) {
        if (error instanceof Error) {
          Assert.eq('Error message should be correct', 'Splat (*) must be its own segment in pattern "/a/*foo/c"', error.message);
        }
      }
    });
  });

  context('replaceParams', () => {
    const testReplaceParams = (testCase: { pattern: string; params: Record<string, string>; expected: string }) => {
      const result = PathPattern.replaceParams(testCase.pattern, testCase.params);

      Assert.eq('Should replace parameters in the pattern', testCase.expected, result);
    };

    it('TINY-13051: should replace named parameter', () => testReplaceParams({
      pattern: '/a/:param/c',
      params: { param: 'b' },
      expected: '/a/b/c'
    }));

    it('TINY-13051: should replace multiple named parameters', () => testReplaceParams({
      pattern: '/:one/:two/:three',
      params: { one: 'a', two: 'b', three: 'c' },
      expected: '/a/b/c'
    }));

    it('TINY-13051: should URL encode replaced parameters', () => testReplaceParams({
      pattern: '/a/:param/c',
      params: { param: 'b b' },
      expected: '/a/b%20b/c'
    }));

    it('TINY-13051: should throw error when replacing splat parameter', () => {
      try {
        PathPattern.replaceParams('/a/*/c', { splat0: 'b' });
        Assert.fail('Expected replaceParams to throw an error');
      } catch (error) {
        if (error instanceof Error) {
          Assert.eq('Error message should be correct', 'Cannot replace splat parameters with replaceParams', error.message);
        }
      }
    });

    it('TINY-13051: should throw error when param name is invalid', () => {
      try {
        PathPattern.replaceParams('/a/:!nvalid/c', { '!nvalid': 'b' });
        Assert.fail('Expected replaceParams to throw an error');
      } catch (error) {
        if (error instanceof Error) {
          Assert.eq('Error message should be correct', 'Invalid param name "!nvalid" in pattern "/a/:!nvalid/c"', error.message);
        }
      }
    });

    it('TINY-13051: should throw error when param is missing', () => {
      try {
        PathPattern.replaceParams('/a/:param/c', { });
        Assert.fail('Expected replaceParams to throw an error');
      } catch (error) {
        if (error instanceof Error) {
          Assert.eq('Error message should be correct', 'Missing param "param" in params {} for pattern "/a/:param/c"', error.message);
        }
      }
    });
  });

  context('getParamNames', () => {
    it('TINY-13051: should get named parameter', () => {
      Assert.eq('Should return the correct param names', [ 'param' ], PathPattern.getParamNames('/a/:param/c'));
    });

    it('TINY-13051: should get multiple named parameters', () => {
      Assert.eq('Should return the correct param names', [ 'one', 'two', 'three' ], PathPattern.getParamNames('/:one/:two/:three'));
    });

    it('TINY-13051: should get splat parameter', () => {
      Assert.eq('Should return the correct param names', [ 'splat0' ], PathPattern.getParamNames('/a/*/c'));
    });

    it('TINY-13051: should get multiple splat parameters', () => {
      Assert.eq('Should return the correct param names', [ 'splat0', 'splat1' ], PathPattern.getParamNames('/*/b/*'));
    });

    it('TINY-13051: should get named and splat parameters', () => {
      Assert.eq('Should return the correct param names', [ 'param', 'splat0' ], PathPattern.getParamNames('/a/:param/*'));
    });
  });
});
