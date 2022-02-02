import { describe, it } from '@ephox/bedrock-client';
import fc from 'fast-check';

import * as Arr from 'ephox/katamari/api/Arr';
import * as Fun from 'ephox/katamari/api/Fun';
import { Optional } from 'ephox/katamari/api/Optional';
import * as Optionals from 'ephox/katamari/api/Optionals';
import { assertNone, assertSome } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.arr.ArrFindMapTest', () => {
  it('Arr.findMap of empty is none', () => {
    assertNone(Arr.findMap([], Fun.die('should not be called')));
  });

  it('Arr.findMap of non-empty is first if f is Optional.some', () => {
    fc.assert(fc.property(
      fc.integer(),
      fc.array(fc.integer()),
      (head, tail) => {
        const arr = [ head, ...tail ];
        assertSome(Arr.findMap(arr, Optional.some), head);
      }
    ));
  });

  it('Arr.findMap of non-empty is none if f is Optional.none', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      (arr) => {
        assertNone(Arr.findMap(arr, Optional.none));
      }
    ));
  });

  it('Arr.findMap finds an element', () => {
    fc.assert(fc.property(
      fc.array(fc.integer()),
      fc.integer(),
      fc.integer(),
      fc.array(fc.integer()),
      (prefix, element, ret, suffix) => {
        const arr = [ ...prefix, element, ...suffix ];
        assertSome(Arr.findMap(arr, (x) => Optionals.someIf(x === element, ret)), ret);
      }
    ));
  });

  it('Arr.findMap does not find an element', () => {
    fc.assert(fc.property(
      fc.array(fc.nat()),
      fc.nat(),
      (arr, ret) => {
        assertNone(Arr.findMap(arr, (x) => Optionals.someIf(x === -1, ret)));
      }
    ));
  });
});
