import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';
import fc from 'fast-check';

import * as Fun from 'ephox/katamari/api/Fun';
import * as HashMap from 'ephox/katamari/api/HashMap';
import { Optional } from 'ephox/katamari/api/Optional';
import { assertNone } from 'ephox/katamari/test/AssertOptional';

describe('atomic.katamari.api.hash_datasets.HashMapTest', () => {
  describe('Constructors', () => {
    it('TINY-13479: empty creates an empty map', () => {
      const map = HashMap.empty<string, number>();
      assert.equal(HashMap.size(map), 0);
      assert.isTrue(HashMap.isEmpty(map));
    });

    it('TINY-13479: make creates a map from entries', () => {
      const map = HashMap.make([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      assert.equal(HashMap.size(map), 3);
      HashMap.get(map, 'a').each((val) => assert.equal(val, 1));
      HashMap.get(map, 'b').each((val) => assert.equal(val, 2));
      HashMap.get(map, 'c').each((val) => assert.equal(val, 3));
    });

    it('TINY-13479: make overwrites duplicate keys', () => {
      const map = HashMap.make([ 'a', 1 ], [ 'a', 2 ], [ 'a', 3 ]);
      assert.equal(HashMap.size(map), 1);
      HashMap.get(map, 'a').each((val) => assert.equal(val, 3));
    });

    it('TINY-13479: pure creates a map with single entry', () => {
      const map = HashMap.pure('key', 42);
      assert.equal(HashMap.size(map), 1);
      HashMap.get(map, 'key').each((val) => assert.equal(val, 42));
    });

    it('TINY-13479: fromIterable creates a map from iterable', () => {
      const tempMap = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const map = HashMap.fromIterable(tempMap.entries());
      assert.equal(HashMap.size(map), 3);
      HashMap.get(map, 'b').each((val) => assert.equal(val, 2));
    });

    it('TINY-13479: fromArray creates a map from array-like', () => {
      const tempMap = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const map = HashMap.fromArray(Array.from(tempMap.entries()));
      assert.equal(HashMap.size(map), 2);
      HashMap.get(map, 'a').each((val) => assert.equal(val, 1));
    });
  });

  describe('Basic Operations', () => {
    it('TINY-13479: set adds a key-value pair to the map', () => {
      const map1 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const map2 = HashMap.set(map1, 'c', 3);
      assert.equal(HashMap.size(map2), 3);
      HashMap.get(map2, 'c').each((val) => assert.equal(val, 3));
      // Original map unchanged
      assert.equal(HashMap.size(map1), 2);
      assertNone(HashMap.get(map1, 'c'));
    });

    it('TINY-13479: set updates existing key', () => {
      const map1 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const map2 = HashMap.set(map1, 'a', 10);
      assert.equal(HashMap.size(map2), 2);
      HashMap.get(map2, 'a').each((val) => assert.equal(val, 10));
      // Original map unchanged
      HashMap.get(map1, 'a').each((val) => assert.equal(val, 1));
    });

    it('TINY-13479: remove removes a key from the map', () => {
      const map1 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const map2 = HashMap.remove(map1, 'b');
      assert.equal(HashMap.size(map2), 2);
      assertNone(HashMap.get(map2, 'b'));
      // Original map unchanged
      assert.equal(HashMap.size(map1), 3);
      HashMap.get(map1, 'b').each((val) => assert.equal(val, 2));
    });

    it('TINY-13479: remove non-existent key does not change map', () => {
      const map1 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const map2 = HashMap.remove(map1, 'z');
      assert.equal(HashMap.size(map2), 2);
    });

    it('TINY-13479: get returns Optional.some for existing key', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.get(map, 'a');
      result.each((val) => assert.equal(val, 1));
    });

    it('TINY-13479: get returns Optional.none for non-existent key', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.get(map, 'z');
      assertNone(result);
    });

    it('TINY-13479: has checks if key exists', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      assert.isTrue(HashMap.has(map, 'a'));
      assert.isFalse(HashMap.has(map, 'z'));
    });
  });

  describe('Getters & Properties', () => {
    it('TINY-13479: size returns the number of entries', () => {
      assert.equal(HashMap.size(HashMap.empty()), 0);
      assert.equal(HashMap.size(HashMap.make([ 'a', 1 ])), 1);
      assert.equal(HashMap.size(HashMap.make([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ])), 3);
    });

    it('TINY-13479: isEmpty checks if map is empty', () => {
      assert.isTrue(HashMap.isEmpty(HashMap.empty()));
      assert.isFalse(HashMap.isEmpty(HashMap.make([ 'a', 1 ])));
    });

    it('TINY-13479: keys returns an iterator of keys', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const keyArray = Array.from(HashMap.keys(map)).sort();
      assert.deepEqual(keyArray, [ 'a', 'b', 'c' ]);
    });

    it('TINY-13479: values returns an iterator of values', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const valArray = Array.from(HashMap.values(map)).sort();
      assert.deepEqual(valArray, [ 1, 2, 3 ]);
    });

    it('TINY-13479: entries returns an iterator of key-value pairs', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const entryArray = Array.from(HashMap.entries(map));
      assert.equal(entryArray.length, 2);
      assert.isTrue(entryArray.some(([ k, v ]) => k === 'a' && v === 1));
      assert.isTrue(entryArray.some(([ k, v ]) => k === 'b' && v === 2));
    });

    it('TINY-13479: toArray converts map to array of entries', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const arr = HashMap.toArray(map);
      assert.equal(arr.length, 2);
      assert.isTrue(arr.some(([ k, v ]) => k === 'a' && v === 1));
      assert.isTrue(arr.some(([ k, v ]) => k === 'b' && v === 2));
    });

    it('TINY-13479: toKeys converts map to array of keys', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const keys = HashMap.toKeys(map).sort();
      assert.deepEqual(keys, [ 'a', 'b', 'c' ]);
    });

    it('TINY-13479: toValues converts map to array of values', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const vals = HashMap.toValues(map).sort();
      assert.deepEqual(vals, [ 1, 2, 3 ]);
    });
  });

  describe('Predicates & Testing', () => {
    it('TINY-13479: exists checks if at least one value satisfies predicate', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      assert.isTrue(HashMap.exists(map, (v) => v > 2));
      assert.isFalse(HashMap.exists(map, (v) => v > 10));
      assert.isFalse(HashMap.exists(HashMap.empty(), Fun.always));
    });

    it('TINY-13479: exists predicate receives value and key', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      assert.isTrue(HashMap.exists(map, (_v, k) => k === 'b'));
    });

    it('TINY-13479: forall checks if all values satisfy predicate', () => {
      const map = HashMap.make<string, number>([ 'a', 2 ], [ 'b', 4 ], [ 'c', 6 ]);
      assert.isTrue(HashMap.forall(map, (v) => v % 2 === 0));
      assert.isFalse(HashMap.forall(map, (v) => v > 5));
      assert.isTrue(HashMap.forall(HashMap.empty(), Fun.never));
    });

    it('TINY-13479: equal checks if two maps are equal', () => {
      const map1 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const map2 = HashMap.make<string, number>([ 'b', 2 ], [ 'a', 1 ]);
      const map3 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 3 ]);
      assert.isTrue(HashMap.equal(map1, map2));
      assert.isFalse(HashMap.equal(map1, map3));
      assert.isTrue(HashMap.equal(HashMap.empty(), HashMap.empty()));
    });
  });

  describe('Map Operations', () => {
    it('TINY-13479: union combines two maps', () => {
      const map1 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const map2 = HashMap.make<string, number>([ 'b', 20 ], [ 'c', 3 ]);
      const result = HashMap.union(map1, map2);
      assert.equal(HashMap.size(result), 3);
      HashMap.get(result, 'a').each((val) => assert.equal(val, 1));
      HashMap.get(result, 'b').each((val) => assert.equal(val, 20)); // Second map takes precedence
      HashMap.get(result, 'c').each((val) => assert.equal(val, 3));
    });

    it('TINY-13479: intersection returns entries with keys in both maps', () => {
      const map1 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const map2 = HashMap.make<string, number>([ 'b', 20 ], [ 'c', 30 ], [ 'd', 4 ]);
      const result = HashMap.intersection(map1, map2);
      assert.equal(HashMap.size(result), 2);
      HashMap.get(result, 'b').each((val) => assert.equal(val, 2)); // Values from first map
      HashMap.get(result, 'c').each((val) => assert.equal(val, 3));
    });

    it('TINY-13479: difference returns entries in first but not second', () => {
      const map1 = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const map2 = HashMap.make<string, number>([ 'b', 20 ], [ 'd', 4 ]);
      const result = HashMap.difference(map1, map2);
      assert.equal(HashMap.size(result), 2);
      HashMap.get(result, 'a').each((val) => assert.equal(val, 1));
      HashMap.get(result, 'c').each((val) => assert.equal(val, 3));
      assertNone(HashMap.get(result, 'b'));
    });
  });

  describe('Transformations', () => {
    it('TINY-13479: map transforms each value', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const result = HashMap.map(map, (v) => v * 2);
      HashMap.get(result, 'a').each((val) => assert.equal(val, 2));
      HashMap.get(result, 'b').each((val) => assert.equal(val, 4));
      HashMap.get(result, 'c').each((val) => assert.equal(val, 6));
    });

    it('TINY-13479: map transformation receives value and key', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.map(map, (v, k) => k + v);
      HashMap.get(result, 'a').each((val) => assert.equal(val, 'a1'));
      HashMap.get(result, 'b').each((val) => assert.equal(val, 'b2'));
    });

    it('TINY-13479: mapEntries transforms both keys and values', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.mapEntries(map, (v, k) => [ k + '_new', v * 10 ] as const);
      HashMap.get(result, 'a_new').each((val) => assert.equal(val, 10));
      HashMap.get(result, 'b_new').each((val) => assert.equal(val, 20));
      assertNone(HashMap.get(result, 'a'));
    });

    it('TINY-13479: filter keeps only entries satisfying predicate', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ], [ 'd', 4 ]);
      const result = HashMap.filter(map, (v) => v % 2 === 0);
      assert.equal(HashMap.size(result), 2);
      HashMap.get(result, 'b').each((val) => assert.equal(val, 2));
      HashMap.get(result, 'd').each((val) => assert.equal(val, 4));
    });

    it('TINY-13479: filter predicate receives value and key', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const result = HashMap.filter(map, (_v, k) => k === 'b' || k === 'c');
      assert.equal(HashMap.size(result), 2);
      assertNone(HashMap.get(result, 'a'));
    });

    it('TINY-13479: partition splits map based on predicate', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ], [ 'd', 4 ]);
      const { pass, fail } = HashMap.partition(map, (v) => v % 2 === 0);
      assert.equal(HashMap.size(pass), 2);
      assert.equal(HashMap.size(fail), 2);
      HashMap.get(pass, 'b').each((val) => assert.equal(val, 2));
      HashMap.get(fail, 'a').each((val) => assert.equal(val, 1));
    });

    it('TINY-13479: bind maps and flattens', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.bind(map, (v, k) => HashMap.make([ k + '1', v ], [ k + '2', v * 10 ]));
      assert.equal(HashMap.size(result), 4);
      HashMap.get(result, 'a1').each((val) => assert.equal(val, 1));
      HashMap.get(result, 'a2').each((val) => assert.equal(val, 10));
      HashMap.get(result, 'b1').each((val) => assert.equal(val, 2));
      HashMap.get(result, 'b2').each((val) => assert.equal(val, 20));
    });
  });

  describe('Iteration & Traversal', () => {
    it('TINY-13479: each executes function for each entry', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const results: string[] = [];
      HashMap.each(map, (v, k) => results.push(k + v));
      assert.equal(results.length, 3);
      assert.isTrue(results.includes('a1'));
      assert.isTrue(results.includes('b2'));
      assert.isTrue(results.includes('c3'));
    });

    it('TINY-13479: foldl reduces map to single value', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const result = HashMap.foldl(map, (acc, v, _k) => acc + v, 0);
      assert.equal(result, 6);
    });

    it('TINY-13479: foldl receives accumulator, value, and key', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.foldl(map, (acc, v, k) => acc + k + v, '');
      assert.isTrue(result === 'a1b2' || result === 'b2a1'); // Order not guaranteed
    });
  });

  describe('Searching', () => {
    it('TINY-13479: find returns first value satisfying predicate', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const result = HashMap.find(map, (v) => v > 1);
      result.each((val) => assert.isTrue(val > 1));
    });

    it('TINY-13479: find returns none when no value satisfies predicate', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.find(map, (v) => v > 10);
      assertNone(result);
    });

    it('TINY-13479: find returns none for empty map', () => {
      const map = HashMap.empty<string, number>();
      const result = HashMap.find(map, Fun.always);
      assertNone(result);
    });

    it('TINY-13479: findKey returns key whose value satisfies predicate', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const result = HashMap.findKey(map, (v) => v === 2);
      result.each((key) => assert.equal(key, 'b'));
    });

    it('TINY-13479: findKey returns none when no value satisfies predicate', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.findKey(map, (v) => v > 10);
      assertNone(result);
    });

    it('TINY-13479: findMap returns first Some result', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ]);
      const result = HashMap.findMap(map, (v) => v > 1 ? Optional.some(v * 10) : Optional.none());
      result.each((val) => assert.isTrue(val > 10));
    });

    it('TINY-13479: findMap returns none when all return none', () => {
      const map = HashMap.make<string, number>([ 'a', 1 ], [ 'b', 2 ]);
      const result = HashMap.findMap(map, () => Optional.none());
      assertNone(result);
    });
  });

  context('Property-based tests', () => {
    const fcEntry = fc.tuple(fc.string(), fc.integer());
    const fcEntries = fc.array(fcEntry);

    it('TINY-13479: set then get returns the value', () => {
      fc.assert(fc.property(fcEntries, fc.string(), fc.integer(), (entries, key, val) => {
        const map = HashMap.fromArray(entries);
        const map2 = HashMap.set(map, key, val);
        HashMap.get(map2, key).each((v) => assert.equal(v, val));
      }));
    });

    it('TINY-13479: set then has returns true', () => {
      fc.assert(fc.property(fcEntries, fc.string(), fc.integer(), (entries, key, val) => {
        const map = HashMap.fromArray(entries);
        const map2 = HashMap.set(map, key, val);
        assert.isTrue(HashMap.has(map2, key));
      }));
    });

    it('TINY-13479: remove then has returns false', () => {
      fc.assert(fc.property(fcEntries, fc.string(), (entries, key) => {
        const entry: [ string, number ] = [ key, 1 ];
        const map = HashMap.fromArray([ ...entries, entry ]);
        const map2 = HashMap.remove(map, key);
        assert.isFalse(HashMap.has(map2, key));
      }));
    });

    it('TINY-13479: map identity equals identity', () => {
      fc.assert(fc.property(fcEntries, (entries) => {
        const map = HashMap.fromArray(entries);
        const result = HashMap.map(map, Fun.identity);
        assert.isTrue(HashMap.equal(map, result));
      }));
    });

    it('TINY-13479: union is associative', () => {
      fc.assert(fc.property(fcEntries, fcEntries, fcEntries, (e1, e2, e3) => {
        const map1 = HashMap.fromArray(e1);
        const map2 = HashMap.fromArray(e2);
        const map3 = HashMap.fromArray(e3);
        const left = HashMap.union(HashMap.union(map1, map2), map3);
        const right = HashMap.union(map1, HashMap.union(map2, map3));
        assert.isTrue(HashMap.equal(left, right));
      }));
    });

    it('TINY-13479: forall with always true returns true for non-empty', () => {
      fc.assert(fc.property(fcEntries, fc.string(), fc.integer(), (entries, k, v) => {
        const entry: [ string, number ] = [ k, v ];
        const map = HashMap.fromArray([ ...entries, entry ]);
        assert.isTrue(HashMap.forall(map, Fun.always));
      }));
    });

    it('TINY-13479: exists with always false returns false', () => {
      fc.assert(fc.property(fcEntries, (entries) => {
        const map = HashMap.fromArray(entries);
        assert.isFalse(HashMap.exists(map, Fun.never));
      }));
    });

    it('TINY-13479: size of union is less than or equal to sum of sizes', () => {
      fc.assert(fc.property(fcEntries, fcEntries, (e1, e2) => {
        const map1 = HashMap.fromArray(e1);
        const map2 = HashMap.fromArray(e2);
        const unionMap = HashMap.union(map1, map2);
        assert.isTrue(HashMap.size(unionMap) <= HashMap.size(map1) + HashMap.size(map2));
      }));
    });

    it('TINY-13479: difference and union are inverses', () => {
      fc.assert(fc.property(fcEntries, fcEntries, (e1, e2) => {
        const map1 = HashMap.fromArray(e1);
        const map2 = HashMap.fromArray(e2);
        const diff = HashMap.difference(map1, map2);
        const result = HashMap.union(diff, map2);
        // All keys from map1 should either be in diff or map2
        HashMap.each(map1, (_v, k) => {
          assert.isTrue(HashMap.has(result, k));
        });
      }));
    });
  });
});
