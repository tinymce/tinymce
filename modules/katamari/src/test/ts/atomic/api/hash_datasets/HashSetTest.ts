import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import * as HashSet from 'ephox/katamari/api/HashSet';
import { Optional } from 'ephox/katamari/api/Optional';
import { assertNone } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.hash_datasets.HashSetTest', () => {
  describe('Constructors', () => {
    it('TINY-13479: empty creates an empty set', () => {
      const set = HashSet.empty<number>();
      assert.equal(HashSet.size(set), 0);
      assert.isTrue(HashSet.isEmpty(set));
    });

    it('TINY-13479: make creates a set from values', () => {
      const set = HashSet.make(1, 2, 3, 2, 1);
      assert.equal(HashSet.size(set), 3);
      assert.isTrue(HashSet.contains(set, 1));
      assert.isTrue(HashSet.contains(set, 2));
      assert.isTrue(HashSet.contains(set, 3));
    });

    it('TINY-13479: pure creates a set with single value', () => {
      const set = HashSet.pure(42);
      assert.equal(HashSet.size(set), 1);
      assert.isTrue(HashSet.contains(set, 42));
    });

    it('TINY-13479: fromArray creates a set from array', () => {
      const set = HashSet.fromArray([ 1, 2, 3, 2, 1 ]);
      assert.equal(HashSet.size(set), 3);
      assert.deepEqual(HashSet.toArray(set).sort(), [ 1, 2, 3 ]);
    });

    it('TINY-13479: fromIterable creates a set from iterable', () => {
      const set = HashSet.fromIterable(new Set([ 1, 2, 3 ]));
      assert.equal(HashSet.size(set), 3);
      assert.deepEqual(HashSet.toArray(set).sort(), [ 1, 2, 3 ]);
    });
  });

  describe('Basic Operations', () => {
    it('TINY-13479: add adds a value to the set', () => {
      const set1 = HashSet.make(1, 2);
      const set2 = HashSet.add(set1, 3);
      assert.equal(HashSet.size(set2), 3);
      assert.isTrue(HashSet.contains(set2, 3));
      // Original set unchanged
      assert.equal(HashSet.size(set1), 2);
      assert.isFalse(HashSet.contains(set1, 3));
    });

    it('TINY-13479: add with existing value does not change size', () => {
      const set1 = HashSet.make(1, 2, 3);
      const set2 = HashSet.add(set1, 2);
      assert.equal(HashSet.size(set2), 3);
    });

    it('TINY-13479: remove removes a value from the set', () => {
      const set1 = HashSet.make(1, 2, 3);
      const set2 = HashSet.remove(set1, 2);
      assert.equal(HashSet.size(set2), 2);
      assert.isFalse(HashSet.contains(set2, 2));
      // Original set unchanged
      assert.equal(HashSet.size(set1), 3);
      assert.isTrue(HashSet.contains(set1, 2));
    });

    it('TINY-13479: remove non-existent value does not change set', () => {
      const set1 = HashSet.make(1, 2, 3);
      const set2 = HashSet.remove(set1, 10);
      assert.equal(HashSet.size(set2), 3);
    });

    it('TINY-13479: toggle adds value when not present', () => {
      const set1 = HashSet.make(1, 2);
      const set2 = HashSet.toggle(set1, 3);
      assert.equal(HashSet.size(set2), 3);
      assert.isTrue(HashSet.contains(set2, 3));
    });

    it('TINY-13479: toggle removes value when present', () => {
      const set1 = HashSet.make(1, 2, 3);
      const set2 = HashSet.toggle(set1, 2);
      assert.equal(HashSet.size(set2), 2);
      assert.isFalse(HashSet.contains(set2, 2));
    });

    it('TINY-13479: contains checks if value exists', () => {
      const set = HashSet.make(1, 2, 3);
      assert.isTrue(HashSet.contains(set, 2));
      assert.isFalse(HashSet.contains(set, 10));
    });
  });

  describe('Getters & Properties', () => {
    it('TINY-13479: size returns the number of elements', () => {
      assert.equal(HashSet.size(HashSet.empty()), 0);
      assert.equal(HashSet.size(HashSet.make(1)), 1);
      assert.equal(HashSet.size(HashSet.make(1, 2, 3)), 3);
    });

    it('TINY-13479: isEmpty checks if set is empty', () => {
      assert.isTrue(HashSet.isEmpty(HashSet.empty()));
      assert.isFalse(HashSet.isEmpty(HashSet.make(1)));
    });

    it('TINY-13479: values returns an iterator', () => {
      const set = HashSet.make(1, 2, 3);
      const vals = Array.from(HashSet.values(set)).sort();
      assert.deepEqual(vals, [ 1, 2, 3 ]);
    });

    it('TINY-13479: toArray converts set to array', () => {
      const set = HashSet.make(3, 1, 2);
      const arr = HashSet.toArray(set).sort();
      assert.deepEqual(arr, [ 1, 2, 3 ]);
    });

    it('TINY-13479: toValues converts set to array of values', () => {
      const set = HashSet.make(3, 1, 2);
      const vals = HashSet.toValues(set).sort();
      assert.deepEqual(vals, [ 1, 2, 3 ]);
    });
  });

  describe('Predicates & Testing', () => {
    it('TINY-13479: exists checks if at least one element satisfies predicate', () => {
      const set = HashSet.make(1, 2, 3, 4, 5);
      assert.isTrue(HashSet.exists(set, (x) => x > 3));
      assert.isFalse(HashSet.exists(set, (x) => x > 10));
      assert.isFalse(HashSet.exists(HashSet.empty(), Fun.always));
    });

    it('TINY-13479: some is alias for exists', () => {
      const set = HashSet.make(1, 2, 3);
      assert.isTrue(HashSet.some(set, (x) => x === 2));
      assert.isFalse(HashSet.some(set, (x) => x === 10));
    });

    it('TINY-13479: forall checks if all elements satisfy predicate', () => {
      const set = HashSet.make(2, 4, 6, 8);
      assert.isTrue(HashSet.forall(set, (x) => x % 2 === 0));
      assert.isFalse(HashSet.forall(set, (x) => x > 5));
      assert.isTrue(HashSet.forall(HashSet.empty(), Fun.never));
    });

    it('TINY-13479: every is alias for forall', () => {
      const set = HashSet.make(1, 2, 3);
      assert.isTrue(HashSet.every(set, (x) => x > 0));
      assert.isFalse(HashSet.every(set, (x) => x > 2));
    });

    it('TINY-13479: equal checks if two sets are equal', () => {
      const set1 = HashSet.make(1, 2, 3);
      const set2 = HashSet.make(3, 2, 1);
      const set3 = HashSet.make(1, 2, 4);
      assert.isTrue(HashSet.equal(set1, set2));
      assert.isFalse(HashSet.equal(set1, set3));
      assert.isTrue(HashSet.equal(HashSet.empty(), HashSet.empty()));
    });
  });

  describe('Set Operations', () => {
    it('TINY-13479: union combines two sets', () => {
      const set1 = HashSet.make(1, 2, 3);
      const set2 = HashSet.make(3, 4, 5);
      const result = HashSet.union(set1, set2);
      assert.equal(HashSet.size(result), 5);
      assert.deepEqual(HashSet.toArray(result).sort(), [ 1, 2, 3, 4, 5 ]);
    });

    it('TINY-13479: intersection returns common elements', () => {
      const set1 = HashSet.make(1, 2, 3, 4);
      const set2 = HashSet.make(3, 4, 5, 6);
      const result = HashSet.intersection(set1, set2);
      assert.equal(HashSet.size(result), 2);
      assert.deepEqual(HashSet.toArray(result).sort(), [ 3, 4 ]);
    });

    it('TINY-13479: difference returns elements in first but not second', () => {
      const set1 = HashSet.make(1, 2, 3, 4);
      const set2 = HashSet.make(3, 4, 5, 6);
      const result = HashSet.difference(set1, set2);
      assert.equal(HashSet.size(result), 2);
      assert.deepEqual(HashSet.toArray(result).sort(), [ 1, 2 ]);
    });

    it('TINY-13479: symmetricDifference returns elements in either but not both', () => {
      const set1 = HashSet.make(1, 2, 3, 4);
      const set2 = HashSet.make(3, 4, 5, 6);
      const result = HashSet.symmetricDifference(set1, set2);
      assert.equal(HashSet.size(result), 4);
      assert.deepEqual(HashSet.toArray(result).sort(), [ 1, 2, 5, 6 ]);
    });

    it('TINY-13479: isSubsetOf checks if first set is subset of second', () => {
      const set1 = HashSet.make(1, 2);
      const set2 = HashSet.make(1, 2, 3, 4);
      const set3 = HashSet.make(1, 5);
      assert.isTrue(HashSet.isSubsetOf(set1, set2));
      assert.isFalse(HashSet.isSubsetOf(set3, set2));
      assert.isTrue(HashSet.isSubsetOf(HashSet.empty(), set2));
    });

    it('TINY-13479: isSupersetOf checks if first set is superset of second', () => {
      const set1 = HashSet.make(1, 2, 3, 4);
      const set2 = HashSet.make(1, 2);
      const set3 = HashSet.make(1, 5);
      assert.isTrue(HashSet.isSupersetOf(set1, set2));
      assert.isFalse(HashSet.isSupersetOf(set1, set3));
      assert.isTrue(HashSet.isSupersetOf(set1, HashSet.empty()));
    });

    it('TINY-13479: isDisjointFrom checks if sets have no common elements', () => {
      const set1 = HashSet.make(1, 2, 3);
      const set2 = HashSet.make(4, 5, 6);
      const set3 = HashSet.make(3, 4, 5);
      assert.isTrue(HashSet.isDisjointFrom(set1, set2));
      assert.isFalse(HashSet.isDisjointFrom(set1, set3));
    });
  });

  describe('Transformations', () => {
    it('TINY-13479: map transforms each element', () => {
      const set = HashSet.make(1, 2, 3);
      const result = HashSet.map(set, (x) => x * 2);
      assert.deepEqual(HashSet.toArray(result).sort(), [ 2, 4, 6 ]);
    });

    it('TINY-13479: map removes duplicates after transformation', () => {
      const set = HashSet.make(1, 2, 3);
      const result = HashSet.map(set, Fun.constant(1));
      assert.equal(HashSet.size(result), 1);
      assert.isTrue(HashSet.contains(result, 1));
    });

    it('TINY-13479: filter keeps only elements satisfying predicate', () => {
      const set = HashSet.make(1, 2, 3, 4, 5);
      const result = HashSet.filter(set, (x) => x % 2 === 0);
      assert.deepEqual(HashSet.toArray(result).sort(), [ 2, 4 ]);
    });

    it('TINY-13479: partition splits set based on predicate', () => {
      const set = HashSet.make(1, 2, 3, 4, 5, 6);
      const { pass, fail } = HashSet.partition(set, (x) => x % 2 === 0);
      assert.deepEqual(HashSet.toArray(pass).sort(), [ 2, 4, 6 ]);
      assert.deepEqual(HashSet.toArray(fail).sort(), [ 1, 3, 5 ]);
    });

    it('TINY-13479: flatten flattens a set of sets', () => {
      const set = HashSet.make(
        HashSet.make(1, 2),
        HashSet.make(3, 4),
        HashSet.make(4, 5)
      );
      const result = HashSet.flatten(set);
      assert.deepEqual(HashSet.toArray(result).sort(), [ 1, 2, 3, 4, 5 ]);
    });

    it('TINY-13479: bind maps and flattens', () => {
      const set = HashSet.make(1, 2, 3);
      const result = HashSet.bind(set, (x) => HashSet.make(x, x * 10));
      assert.deepEqual(HashSet.toArray(result).sort(), [ 1, 2, 3, 10, 20, 30 ]);
    });

    it('TINY-13479: flatMap is alias for bind', () => {
      const set = HashSet.make(1, 2);
      const f = (x: number) => HashSet.make(x, x + 10);
      const result1 = HashSet.bind(set, f);
      const result2 = HashSet.flatMap(set, f);
      assert.isTrue(HashSet.equal(result1, result2));
    });
  });

  describe('Iteration & Traversal', () => {
    it('TINY-13479: each executes function for each element', () => {
      const set = HashSet.make(1, 2, 3);
      const results: number[] = [];
      HashSet.each(set, (x) => results.push(x * 2));
      assert.deepEqual(results.sort(), [ 2, 4, 6 ]);
    });

    it('TINY-13479: foldl reduces set to single value', () => {
      const set = HashSet.make(1, 2, 3, 4);
      const result = HashSet.foldl(set, (acc, x) => acc + x, 0);
      assert.equal(result, 10);
    });

    it('TINY-13479: reduce is alias for foldl', () => {
      const set = HashSet.make(1, 2, 3);
      const result1 = HashSet.foldl(set, (acc, x) => acc + x, 0);
      const result2 = HashSet.reduce(set, (acc, x) => acc + x, 0);
      assert.equal(result1, result2);
    });
  });

  describe('Searching', () => {
    it('TINY-13479: find returns first element satisfying predicate', () => {
      const set = HashSet.make(1, 2, 3, 4, 5);
      const result = HashSet.find(set, (x) => x > 3);
      result.each((val) => assert.isTrue(val > 3));
    });

    it('TINY-13479: find returns none when no element satisfies predicate', () => {
      const set = HashSet.make(1, 2, 3);
      const result = HashSet.find(set, (x) => x > 10);
      assertNone(result);
    });

    it('TINY-13479: find returns none for empty set', () => {
      const set = HashSet.empty<number>();
      const result = HashSet.find(set, Fun.always);
      assertNone(result);
    });

    it('TINY-13479: findMap returns first Some result', () => {
      const set = HashSet.make(1, 2, 3, 4, 5);
      const result = HashSet.findMap(set, (x) => x > 3 ? Optional.some(x * 10) : Optional.none());
      result.each((val) => assert.isTrue(val > 30));
    });

    it('TINY-13479: findMap returns none when all return none', () => {
      const set = HashSet.make(1, 2, 3);
      const result = HashSet.findMap(set, () => Optional.none());
      assertNone(result);
    });
  });

  context('Property-based tests', () => {
    it('TINY-13479: add then contains returns true', () => {
      fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, val) => {
        const set = HashSet.fromArray(arr);
        const set2 = HashSet.add(set, val);
        assert.isTrue(HashSet.contains(set2, val));
      }));
    });

    it('TINY-13479: remove then contains returns false', () => {
      fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, val) => {
        const set = HashSet.fromArray([ ...arr, val ]);
        const set2 = HashSet.remove(set, val);
        assert.isFalse(HashSet.contains(set2, val));
      }));
    });

    it('TINY-13479: map identity equals identity', () => {
      fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
        const set = HashSet.fromArray(arr);
        const result = HashSet.map(set, Fun.identity);
        assert.isTrue(HashSet.equal(set, result));
      }));
    });

    it('TINY-13479: union is commutative', () => {
      fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (arr1, arr2) => {
        const set1 = HashSet.fromArray(arr1);
        const set2 = HashSet.fromArray(arr2);
        const union1 = HashSet.union(set1, set2);
        const union2 = HashSet.union(set2, set1);
        assert.isTrue(HashSet.equal(union1, union2));
      }));
    });

    it('TINY-13479: intersection is commutative', () => {
      fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (arr1, arr2) => {
        const set1 = HashSet.fromArray(arr1);
        const set2 = HashSet.fromArray(arr2);
        const int1 = HashSet.intersection(set1, set2);
        const int2 = HashSet.intersection(set2, set1);
        assert.isTrue(HashSet.equal(int1, int2));
      }));
    });

    it('TINY-13479: forall with always true returns true for non-empty', () => {
      fc.assert(fc.property(fc.array(fc.integer()), fc.integer(), (arr, val) => {
        const set = HashSet.fromArray([ ...arr, val ]);
        assert.isTrue(HashSet.forall(set, Fun.always));
      }));
    });

    it('TINY-13479: exists with always false returns false', () => {
      fc.assert(fc.property(fc.array(fc.integer()), (arr) => {
        const set = HashSet.fromArray(arr);
        assert.isFalse(HashSet.exists(set, Fun.never));
      }));
    });

    it('TINY-13479: size of union is less than or equal to sum of sizes', () => {
      fc.assert(fc.property(fc.array(fc.integer()), fc.array(fc.integer()), (arr1, arr2) => {
        const set1 = HashSet.fromArray(arr1);
        const set2 = HashSet.fromArray(arr2);
        const unionSet = HashSet.union(set1, set2);
        assert.isTrue(HashSet.size(unionSet) <= HashSet.size(set1) + HashSet.size(set2));
      }));
    });
  });
});
