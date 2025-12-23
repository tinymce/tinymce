/**
 * HashMap - Immutable Map Operations
 *
 * An immutable, unordered collection of key-value pairs built on JavaScript's native Map.
 * All operations return new Maps, leaving the original unchanged.
 *
 * ## When to Use HashMap
 *
 * Choose HashMap over other collections when:
 * - You need to associate keys with values (key-value mappings)
 * - You frequently need to look up values by their keys
 * - Keys can be any type (objects, functions, primitives)
 * - You need immutable, side-effect-free operations
 * - The order of entries doesn't matter to your use case
 * - You need better performance than plain objects for frequent updates
 *
 * Choose other collections when:
 * - You only need unique values without associations (use HashSet)
 * - You need to maintain insertion order reliably (use arrays of tuples)
 * - You need indexed access to elements (use arrays)
 * - Keys are always strings and you prefer plain object syntax (use Obj)
 * - You need maximum performance with many modifications (consider direct Map mutation)
 *
 * ## Advantages Over Plain Objects
 *
 * HashMap (based on Map) offers several advantages over plain JavaScript objects:
 *
 * **Key Types**: Map keys can be any value (objects, functions, primitives), while object
 * keys must be strings or symbols.
 *
 * **No Accidental Keys**: A Map contains only what you explicitly add, while objects have
 * prototype properties that can collide with your keys.
 *
 * **Key Order**: Map maintains insertion order reliably, while object property order has
 * complex rules and historical inconsistencies.
 *
 * **Size**: Map provides a `size` property for O(1) lookup, while objects require
 * `Object.keys(obj).length` which is O(n).
 *
 * **Iteration**: Map is directly iterable with for...of loops, while objects require
 * `Object.keys()` or `Object.entries()`.
 *
 * **Performance**: Map performs better for frequent additions and removals of key-value pairs.
 *
 * **Security**: Map is safer with user-provided keys, as it doesn't risk prototype pollution.
 *
 * ## Common Use Cases
 *
 * - Caching computed values by keys
 * - Storing metadata or configuration indexed by objects
 * - Implementing lookup tables or dictionaries
 * - Associating data with DOM elements or other objects
 * - Building indexes for fast data retrieval
 * - Functional programming patterns where immutability is important
 *
 * ## Performance Characteristics
 *
 * - Lookup via get: O(1) average time - Retrieve a value by key
 * - Insertion via set: O(1) average time - Add or update a key-value pair (returns new Map)
 * - Removal via remove: O(1) average time - Delete a key-value pair (returns new Map)
 * - Iteration: O(n) time - Iterate over all entries
 * - Key existence check: O(1) average time - Check if a key exists
 *
 * Note: Because this is an immutable implementation, each modification creates a new Map.
 * If you need to perform many sequential modifications, consider using native Map directly
 * and converting to/from HashMap operations as needed.
 *
 * @example
 * ```typescript
 * import * as HashMap from './HashMap';
 *
 * // Create a Map
 * const userScores = HashMap.make(['alice', 100], ['bob', 85]);
 *
 * // Add a new entry (immutable - returns new Map)
 * const updated = HashMap.set(userScores, 'charlie', 95);
 *
 * // Get a value
 * const aliceScore = HashMap.get(updated, 'alice'); // Optional.some(100)
 *
 * // Transform values
 * const bonusScores = HashMap.map(updated, (score) => score + 10);
 *
 * // Filter entries
 * const highScores = HashMap.filter(bonusScores, (score) => score > 100);
 *
 * // Convert from object
 * const config = HashMap.fromObject({ timeout: 5000, retries: 3 });
 * ```
 *
 * @module HashMap
 */

import { Eq } from '@ephox/dispute';

import { Optional } from './Optional';

type MapMorphism<K, V, R> = (value: V, key: K) => R;
type MapGuardPredicate<K, V, U extends V> = (value: V, key: K) => value is U;
type MapPredicate<K, V> = MapMorphism<K, V, boolean>;

// ============================================================================
// Constructors
// ============================================================================

/**
 * Creates an empty Map.
 *
 * @returns An empty Map
 */
export const empty = <K, V>(): Map<K, V> => new Map<K, V>();

/**
 * Creates a Map from an array of key-value pairs.
 *
 * @param entries - Array of [key, value] tuples
 * @returns A new Map containing all the entries
 */
export const make = <K, V>(...entries: Array<readonly [K, V]>): Map<K, V> => new Map(entries);

/**
 * Creates a Map containing a single key-value pair.
 *
 * @param key - The key
 * @param value - The value
 * @returns A new Map containing only the provided entry
 */
export const pure = <K, V>(key: K, value: V): Map<K, V> => new Map([[ key, value ]]);

/**
 * Creates a Map from an iterable of key-value pairs.
 *
 * @param entries - Iterable of [key, value] tuples
 * @returns A new Map containing all entries from the iterable
 */
export const fromIterable = <K, V>(entries: Iterable<readonly [K, V]>): Map<K, V> => new Map(entries);

/**
 * Creates a Map from an array-like object of key-value pairs.
 *
 * @param entries - Array-like object of [key, value] tuples
 * @returns A new Map containing all entries from the array-like
 */
export const fromArray = <K, V>(entries: ArrayLike<readonly [K, V]>): Map<K, V> => new Map(Array.from(entries));

/**
 * Creates a Map from a plain JavaScript object.
 * Object keys will be used as Map keys, and object values as Map values.
 * Note: Only string keys from the object are converted.
 *
 * @param obj - The object to convert
 * @returns A new Map containing all entries from the object
 */
export const fromObject = <K extends string, V>(obj: Record<K, V>): Map<K, V> =>
  new Map(Object.entries(obj) as Array<[K, V]>);

// ============================================================================
// Basic Operations
// ============================================================================

/**
 * Creates a new Map with the specified key-value pair added or updated.
 * Does not modify the original map.
 *
 * @param map - The original map
 * @param key - The key to add or update
 * @param value - The value to associate with the key
 * @returns A new Map with the key-value pair set
 */
export const set = <K, V>(map: Map<K, V>, key: K, value: V): Map<K, V> => {
  const result = new Map(map);
  result.set(key, value);
  return result;
};

/**
 * Creates a new Map with the specified key removed.
 * Does not modify the original map.
 *
 * @param map - The original map
 * @param key - The key to remove
 * @returns A new Map without the specified key
 */
export const remove = <K, V>(map: Map<K, V>, key: K): Map<K, V> => {
  const result = new Map(map);
  result.delete(key);
  return result;
};

/**
 * Retrieves the value associated with a key, wrapped in Optional.
 *
 * @param map - The map to query
 * @param key - The key to look up
 * @returns Optional.some(value) if the key exists, Optional.none() otherwise
 * @example
 * ```typescript
 * const map = HashMap.make(['a', 1], ['b', 2]);
 * HashMap.get(map, 'a'); // Optional.some(1)
 * HashMap.get(map, 'c'); // Optional.none()
 * ```
 */
export const get = <K, V>(map: Map<K, V>, key: K): Optional<V> => {
  const value = map.get(key);
  return value !== undefined || map.has(key) ? Optional.some(value as V) : Optional.none();
};

/**
 * Checks if a key exists in the map.
 *
 * @param map - The map to search
 * @param key - The key to look for
 * @returns true if the key exists in the map, false otherwise
 */
export const has = <K, V>(map: Map<K, V>, key: K): boolean => map.has(key);

// ============================================================================
// Getters & Properties
// ============================================================================

/**
 * Returns the number of key-value pairs in the map.
 *
 * @param map - The map to measure
 * @returns The number of entries in the map
 */
export const size = <K, V>(map: Map<K, V>): number => map.size;

/**
 * Tests whether the map is empty.
 *
 * @param map - The map to test
 * @returns true if the map has no entries, false otherwise
 */
export const isEmpty = <K, V>(map: Map<K, V>): boolean => map.size === 0;

/**
 * Returns an iterator of all keys in the map.
 *
 * @param map - The map to iterate
 * @returns An iterator of all keys
 */
export const keys = <K, V>(map: Map<K, V>): IterableIterator<K> => map.keys();

/**
 * Returns an iterator of all values in the map.
 *
 * @param map - The map to iterate
 * @returns An iterator of all values
 */
export const values = <K, V>(map: Map<K, V>): IterableIterator<V> => map.values();

/**
 * Returns an iterator of all key-value pairs in the map.
 *
 * @param map - The map to iterate
 * @returns An iterator of [key, value] tuples
 */
export const entries = <K, V>(map: Map<K, V>): IterableIterator<[K, V]> => map.entries();

/**
 * Converts a Map to an array of key-value tuples.
 *
 * @param map - The map to convert
 * @returns An array of [key, value] tuples
 */
export const toArray = <K, V>(map: Map<K, V>): Array<[K, V]> => Array.from(map);

/**
 * Converts a Map to an array of keys.
 *
 * @param map - The map to convert
 * @returns An array of all keys
 */
export const toKeys = <K, V>(map: Map<K, V>): K[] => Array.from(map.keys());

/**
 * Converts a Map to an array of values.
 *
 * @param map - The map to convert
 * @returns An array of all values
 */
export const toValues = <K, V>(map: Map<K, V>): V[] => Array.from(map.values());

// ============================================================================
// Predicates & Testing
// ============================================================================

/**
 * Checks if at least one value in the map satisfies the predicate.
 * Returns false for empty maps (no entries exist that satisfy the predicate).
 *
 * @param map - The map to test
 * @param pred - The predicate function to test each value and key
 * @returns true if any value satisfies the predicate, false otherwise (including empty maps)
 */
export const exists = <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): boolean => {
  for (const [ k, v ] of map) {
    if (pred(v, k)) {
      return true;
    }
  }
  return false;
};

/**
 * Alias for `exists`. Checks if at least one value in the map satisfies the predicate.
 * This is an alias for `exists` to match common naming conventions.
 * Returns false for empty maps (no entries exist that satisfy the predicate).
 *
 * @param map - The map to test
 * @param pred - The predicate function to test each value and key
 * @returns true if any value satisfies the predicate, false otherwise (including empty maps)
 */
export const some = <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): boolean => exists(map, pred);

/**
 * Tests whether all values in the map satisfy the predicate.
 * Returns true for empty maps (vacuous truth - all zero entries satisfy the predicate).
 *
 * @param map - The map to test
 * @param pred - The predicate function to test each value and key
 * @returns true if all values satisfy the predicate, false otherwise (true for empty maps)
 */
export const forall = <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): boolean => {
  for (const [ k, v ] of map) {
    if (pred(v, k) !== true) {
      return false;
    }
  }
  return true;
};

/**
 * Alias for `forall`. Checks if every value in the map satisfies a predicate.
 * This is an alias for `forall` to match common naming conventions.
 * Returns true for empty maps (vacuous truth - all zero entries satisfy the predicate).
 *
 * @param map - The map to test
 * @param pred - The predicate function to test each value and key
 * @returns true if all values satisfy the predicate, false otherwise (true for empty maps)
 */
export const every = <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): boolean => forall(map, pred);

/**
 * Tests whether two Maps are equal based on custom equality functions for keys and values.
 * Maps are equal if they have the same size and all entries match.
 *
 * @param m1 - The first map
 * @param m2 - The second map
 * @param keyEq - The key equality function (defaults to Eq.eqAny)
 * @param valueEq - The value equality function (defaults to Eq.eqAny)
 * @returns true if the maps are equal, false otherwise
 */
export const equal = <K, V>(
  m1: ReadonlyMap<K, V>,
  m2: ReadonlyMap<K, V>,
  keyEq: Eq.Eq<K> = Eq.eqAny,
  valueEq: Eq.Eq<V> = Eq.eqAny
): boolean => {
  if (m1.size !== m2.size) {
    return false;
  }
  for (const [ k1, v1 ] of m1) {
    let found = false;
    for (const [ k2, v2 ] of m2) {
      if (keyEq.eq(k1, k2)) {
        if (!valueEq.eq(v1, v2)) {
          return false;
        }
        found = true;
        break;
      }
    }
    if (!found) {
      return false;
    }
  }
  return true;
};

// ============================================================================
// Map Operations
// ============================================================================

/**
 * Merges two maps, with entries from the second map overwriting those from the first.
 * Returns a new map containing all entries from both maps.
 *
 * @param m1 - The first map
 * @param m2 - The second map (takes precedence on key conflicts)
 * @returns A new Map containing entries from both maps
 */
export const union = <K, V>(m1: ReadonlyMap<K, V>, m2: ReadonlyMap<K, V>): Map<K, V> => {
  const result = new Map(m1);
  for (const [ k, v ] of m2) {
    result.set(k, v);
  }
  return result;
};

/**
 * Returns a new Map containing only entries whose keys exist in both maps.
 * Values are taken from the first map.
 *
 * @param m1 - The first map
 * @param m2 - The second map
 * @returns A new Map containing entries with keys present in both maps
 */
export const intersection = <K, V>(m1: ReadonlyMap<K, V>, m2: ReadonlyMap<K, V>): Map<K, V> => {
  const result = new Map<K, V>();
  for (const [ k, v ] of m1) {
    if (m2.has(k)) {
      result.set(k, v);
    }
  }
  return result;
};

/**
 * Returns a new Map containing entries from m1 whose keys are not in m2.
 *
 * @param m1 - The first map
 * @param m2 - The map to subtract
 * @returns A new Map containing entries in m1 but not in m2
 */
export const difference = <K, V>(m1: ReadonlyMap<K, V>, m2: ReadonlyMap<K, V>): Map<K, V> => {
  const result = new Map<K, V>();
  for (const [ k, v ] of m1) {
    if (!m2.has(k)) {
      result.set(k, v);
    }
  }
  return result;
};

// ============================================================================
// Transformations
// ============================================================================

/**
 * Transforms each value in the map using the provided function.
 * Keys remain unchanged.
 *
 * @param map - The map to transform
 * @param f - The transformation function
 * @returns A new Map with transformed values
 */
export const map = <K, V, U>(map: ReadonlyMap<K, V>, f: MapMorphism<K, V, U>): Map<K, U> => {
  const result = new Map<K, U>();
  for (const [ k, v ] of map) {
    result.set(k, f(v, k));
  }
  return result;
};

/**
 * Transforms both keys and values in the map using the provided function.
 *
 * @param map - The map to transform
 * @param f - The transformation function that returns [newKey, newValue]
 * @returns A new Map with transformed keys and values
 */
export const mapEntries = <K, V, K2, V2>(
  map: ReadonlyMap<K, V>,
  f: (value: V, key: K) => readonly [K2, V2]
): Map<K2, V2> => {
  const result = new Map<K2, V2>();
  for (const [ k, v ] of map) {
    const [ k2, v2 ] = f(v, k);
    result.set(k2, v2);
  }
  return result;
};

/**
 * Creates a new Map containing only the entries that satisfy the predicate.
 * Supports type guard predicates for narrowing the value type.
 *
 * @param map - The map to filter
 * @param pred - The predicate function to test each entry
 * @returns A new Map containing only entries that satisfy the predicate
 */
export const filter: {
  <K, V, U extends V>(map: ReadonlyMap<K, V>, pred: MapGuardPredicate<K, V, U>): Map<K, U>;
  <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): Map<K, V>;
} = <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): Map<K, V> => {
  const result = new Map<K, V>();
  for (const [ k, v ] of map) {
    if (pred(v, k)) {
      result.set(k, v);
    }
  }
  return result;
};

/**
 * Splits a map into two maps based on a predicate function.
 * Entries that satisfy the predicate go into the 'pass' map,
 * entries that don't go into the 'fail' map.
 *
 * @param map - The map to partition
 * @param pred - The predicate function to test each entry
 * @returns An object with two Maps: 'pass' and 'fail'
 * @example
 * ```typescript
 * const scores = HashMap.make(['alice', 95], ['bob', 82], ['charlie', 88]);
 * const { pass, fail } = HashMap.partition(scores, (score) => score >= 90);
 * // pass: Map { 'alice' => 95 }, fail: Map { 'bob' => 82, 'charlie' => 88 }
 * ```
 */
export const partition = <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): { pass: Map<K, V>; fail: Map<K, V> } => {
  const pass = new Map<K, V>();
  const fail = new Map<K, V>();
  for (const [ k, v ] of map) {
    const target = pred(v, k) ? pass : fail;
    target.set(k, v);
  }
  return { pass, fail };
};

/**
 * Maps a function over the map and flattens the result.
 * Each entry can produce multiple key-value pairs.
 *
 * @param map - The map to transform
 * @param f - A function that transforms each entry into a Map
 * @returns A new Map containing all entries from all resulting Maps
 * @example
 * ```typescript
 * const users = HashMap.make(['admin', ['alice', 'bob']], ['user', ['charlie']]);
 * const expanded = HashMap.bind(users, (names, role) =>
 *   HashMap.fromArray(names.map(name => [name, role] as const))
 * );
 * // Map { 'alice' => 'admin', 'bob' => 'admin', 'charlie' => 'user' }
 * ```
 */
export const bind = <K, V, K2, V2>(map: ReadonlyMap<K, V>, f: (value: V, key: K) => ReadonlyMap<K2, V2>): Map<K2, V2> => {
  const result = new Map<K2, V2>();
  for (const [ k, v ] of map) {
    const inner = f(v, k);
    for (const [ k2, v2 ] of inner) {
      result.set(k2, v2);
    }
  }
  return result;
};

/**
 * Maps a function over the map and flattens the result.
 * This is an alias for `bind` to match common naming conventions.
 *
 * @param map - The map to transform
 * @param f - A function that transforms each entry into a Map
 * @returns A new Map containing all entries from all resulting Maps
 */
export const flatMap = <K, V, K2, V2>(map: ReadonlyMap<K, V>, f: (value: V, key: K) => ReadonlyMap<K2, V2>): Map<K2, V2> => bind(map, f);

// ============================================================================
// Iteration & Traversal
// ============================================================================

/**
 * Executes a function for each entry in the map.
 * This function is for side effects only and does not return a value.
 *
 * @param map - The map to iterate over
 * @param f - The function to execute for each entry
 */
export const each = <K, V>(map: ReadonlyMap<K, V>, f: MapMorphism<K, V, void>): void => {
  for (const [ k, v ] of map) {
    f(v, k);
  }
};

/**
 * Reduces a map to a single value by applying a function to each entry and an accumulator.
 * Processes entries in insertion order.
 *
 * @param map - The map to reduce
 * @param f - The reducer function that takes the accumulator, value, and key
 * @param acc - The initial accumulator value
 * @returns The final accumulated value
 */
export const foldl = <K, V, U>(map: ReadonlyMap<K, V>, f: (acc: U, value: V, key: K) => U, acc: U): U => {
  each(map, (v, k) => {
    acc = f(acc, v, k);
  });
  return acc;
};

/**
 * Reduces a map to a single value by applying a function to each entry and an accumulator.
 * This is an alias for `foldl` to match common naming conventions.
 *
 * @param map - The map to reduce
 * @param f - The reducer function that takes the accumulator, value, and key
 * @param acc - The initial accumulator value
 * @returns The final accumulated value
 */
export const reduce = <K, V, U>(map: ReadonlyMap<K, V>, f: (acc: U, value: V, key: K) => U, acc: U): U => foldl(map, f, acc);

// ============================================================================
// Searching
// ============================================================================

/**
 * Finds the first value in the map that satisfies the predicate.
 * Supports type guard predicates for narrowing the type.
 *
 * @param map - The map to search
 * @param pred - The predicate function to test each entry
 * @returns Optional.some(value) if found, Optional.none() otherwise
 */
export const find: {
  <K, V, U extends V>(map: ReadonlyMap<K, V>, pred: MapGuardPredicate<K, V, U>): Optional<U>;
  <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): Optional<V>;
} = <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): Optional<V> => {
  for (const [ k, v ] of map) {
    if (pred(v, k)) {
      return Optional.some(v);
    }
  }
  return Optional.none();
};

/**
 * Finds the first key in the map whose value satisfies the predicate.
 *
 * @param map - The map to search
 * @param pred - The predicate function to test each entry
 * @returns Optional.some(key) if found, Optional.none() otherwise
 */
export const findKey = <K, V>(map: ReadonlyMap<K, V>, pred: MapPredicate<K, V>): Optional<K> => {
  for (const [ k, v ] of map) {
    if (pred(v, k)) {
      return Optional.some(k);
    }
  }
  return Optional.none();
};

/**
 * Maps a function over the map and returns the first Some result.
 * Useful for searching and transforming in a single operation.
 *
 * @param map - The map to search and transform
 * @param f - A function that returns Optional<B> for each entry
 * @returns The first Some result, or Optional.none() if no entry produces a Some
 */
export const findMap = <K, V, B>(map: ReadonlyMap<K, V>, f: (value: V, key: K) => Optional<B>): Optional<B> => {
  for (const [ k, v ] of map) {
    const r = f(v, k);
    if (r.isSome()) {
      return r;
    }
  }
  return Optional.none<B>();
};
