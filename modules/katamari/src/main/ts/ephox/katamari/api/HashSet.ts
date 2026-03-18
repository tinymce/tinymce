/**
 * HashSet - Immutable Set Operations
 *
 * An immutable, unordered collection of unique values built on JavaScript's native Set.
 * All operations return new Sets, leaving the original unchanged.
 *
 * ## When to Use HashSet
 *
 * Choose HashSet over other collections when:
 * - You need to ensure elements are unique
 * - You frequently need to check if an element exists in the collection
 * - You need to perform set operations like union, intersection, and difference
 * - The order of elements doesn't matter to your use case
 * - You want immutable, side-effect-free operations
 *
 * Choose other collections when:
 * - You need to maintain insertion order (use arrays)
 * - You need key-value associations (use objects or Map)
 * - You need to frequently access elements by index (use arrays)
 * - You need maximum performance with many modifications (consider direct Set mutation)
 *
 * ## Common Use Cases
 *
 * - Tracking unique items (e.g., users who have completed an action)
 * - Efficiently testing for membership in a collection
 * - Performing set theory operations (union, intersection, difference)
 * - Eliminating duplicates from a collection
 * - Functional programming patterns where immutability is important
 *
 * ## Performance Characteristics
 *
 * - Lookup: O(1) average - Check if a value exists
 * - Insertion: O(1) average - Add a value (returns new Set)
 * - Removal: O(1) average - Remove a value (returns new Set)
 * - Iteration: O(n) - Iterate over all values
 * - Set operations: O(n) - Union, intersection, difference
 *
 * Note: Because this is an immutable implementation, each modification creates a new Set.
 * If you need to perform many sequential modifications, consider using native Set directly
 * and converting to/from HashSet operations as needed.
 *
 * @example
 * ```typescript
 * import * as HashSet from './HashSet';
 *
 * // Create a Set
 * const tags = HashSet.make('javascript', 'typescript', 'react');
 *
 * // Add an element (immutable - returns new Set)
 * const moreTags = HashSet.add(tags, 'node');
 *
 * // Check membership
 * const hasReact = HashSet.contains(moreTags, 'react'); // true
 *
 * // Set operations
 * const frontendTags = HashSet.make('react', 'vue', 'angular');
 * const common = HashSet.intersection(moreTags, frontendTags); // Set { 'react' }
 *
 * // Get unique values from array
 * const unique = HashSet.fromArray([1, 2, 2, 3, 3, 3]); // Set { 1, 2, 3 }
 * ```
 *
 * @module HashSet
 */

import { Eq } from '@ephox/dispute';

import { Optional } from './Optional';

type SetMorphism<T, U> = (x: T) => U;
type SetGuardPredicate<T, U extends T> = (x: T) => x is U;
type SetPredicate<T> = SetMorphism<T, boolean>;

// ============================================================================
// Constructors
// ============================================================================

/**
 * Creates an empty Set.
 *
 * @returns An empty Set
 */
export const empty = <T>(): Set<T> => new Set<T>();

/**
 * Creates a Set from multiple values.
 * Duplicate values will be automatically removed.
 *
 * @param values - The values to include in the set
 * @returns A new Set containing all unique values
 */
export const make = <T>(...values: T[]): Set<T> => new Set(values);

/**
 * Creates a Set containing a single element.
 *
 * @param x - The element to wrap in a Set
 * @returns A new Set containing only the provided element
 */
export const pure = <T>(x: T): Set<T> => new Set([ x ]);

/**
 * Creates a Set from an array-like object.
 * Duplicate elements in the array will be automatically removed in the resulting Set.
 *
 * @param array - The array-like object to convert
 * @returns A new Set containing all unique elements from the array
 */
export const fromArray = <T>(array: ArrayLike<T>): Set<T> => new Set(Array.from(array));

/**
 * Creates a Set from an iterable.
 *
 * @param iterable - The iterable to convert
 * @returns A new Set containing all unique elements from the iterable
 */
export const fromIterable = <T>(iterable: Iterable<T>): Set<T> => new Set(iterable);

/**
 * Creates a Set from the values of a plain JavaScript object.
 * Only the values are used; keys are discarded. Duplicate values are automatically removed.
 *
 * @param obj - The object whose values to extract
 * @returns A new Set containing all unique values from the object
 */
export const fromValues = <T extends {}>(obj: T): Set<T[keyof T]> => new Set(Object.values(obj));

// ============================================================================
// Basic Operations
// ============================================================================

/**
 * Creates a new Set with the specified value added.
 * Does not modify the original set.
 *
 * @param set - The original set
 * @param value - The value to add
 * @returns A new Set containing all elements from the original set plus the new value
 */
export const add = <T>(set: Set<T>, value: T): Set<T> => {
  const result = new Set(set);
  result.add(value);
  return result;
};

/**
 * Creates a new Set with the specified value removed.
 * Does not modify the original set.
 *
 * @param set - The original set
 * @param value - The value to remove
 * @returns A new Set containing all elements from the original set except the removed value
 */
export const remove = <T>(set: Set<T>, value: T): Set<T> => {
  const result = new Set(set);
  result.delete(value);
  return result;
};

/**
 * Toggles a value's presence in the set.
 * If the value exists, it is removed; if it doesn't exist, it is added.
 * Does not modify the original set.
 *
 * @param set - The original set
 * @param value - The value to toggle
 * @returns A new Set with the value toggled
 */
export const toggle = <T>(set: Set<T>, value: T): Set<T> => {
  const result = new Set(set);
  if (result.has(value)) {
    result.delete(value);
  } else {
    result.add(value);
  }
  return result;
};

/**
 * Checks if a value exists in the set.
 *
 * @param set - The set to search
 * @param value - The value to look for
 * @returns true if the value is in the set, false otherwise
 */
export const contains = <T>(set: ReadonlySet<T>, value: T): boolean => set.has(value);

// ============================================================================
// Getters & Properties
// ============================================================================

/**
 * Returns the number of elements in the set.
 *
 * @param set - The set to measure
 * @returns The number of elements in the set
 */
export const size = <T>(set: Set<T>): number => set.size;

/**
 * Tests whether the set is empty.
 *
 * @param set - The set to test
 * @returns true if the set has no elements, false otherwise
 */
export const isEmpty = <T>(set: Set<T>): boolean => set.size === 0;

/**
 * Returns an iterator of all values in the set.
 *
 * @param set - The set to iterate
 * @returns An iterator of all values
 */
export const values = <T>(set: Set<T>): IterableIterator<T> => set.values();

/**
 * Converts a Set to an Array.
 *
 * @param set - The set to convert
 * @returns An array containing all elements from the set
 */
export const toArray = <T>(set: Set<T>): T[] => Array.from(set);

// ============================================================================
// Predicates & Testing
// ============================================================================

/**
 * Checks if at least one element in the set satisfies the predicate.
 * Returns false for empty sets (no elements exist that satisfy the predicate).
 *
 * @param set - The set to test
 * @param pred - The predicate function to test each element
 * @returns true if any element satisfies the predicate, false otherwise (including empty sets)
 */
export const exists = <T>(set: ReadonlySet<T>, pred: SetPredicate<T>): boolean => {
  for (const x of set) {
    if (pred(x)) {
      return true;
    }
  }
  return false;
};

/**
 * Tests whether all elements in the set satisfy the predicate.
 * Returns true for empty sets (vacuous truth - all zero elements satisfy the predicate).
 *
 * @param set - The set to test
 * @param pred - The predicate function to test each element
 * @returns true if all elements satisfy the predicate, false otherwise (true for empty sets)
 */
export const forall = <T>(set: ReadonlySet<T>, pred: SetPredicate<T>): boolean => {
  for (const x of set) {
    if (pred(x) !== true) {
      return false;
    }
  }
  return true;
};

/**
 * Tests whether two Sets are equal based on a custom equality function.
 * Sets are equal if they have the same size and all elements in s1 have
 * a corresponding equal element in s2.
 *
 * @param s1 - The first set
 * @param s2 - The second set
 * @param eq - The equality function (defaults to Eq.eqAny)
 * @returns true if the sets are equal, false otherwise
 */
export const equal = <T>(s1: ReadonlySet<T>, s2: ReadonlySet<T>, eq: Eq.Eq<T> = Eq.eqAny): boolean => {
  if (s1.size !== s2.size) {
    return false;
  }
  for (const x of s1) {
    let found = false;
    for (const y of s2) {
      if (eq.eq(x, y)) {
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
// Set Theory Operations
// ============================================================================

/**
 * Returns a new Set containing all elements from both sets.
 * Duplicates are automatically removed due to Set semantics.
 *
 * @param s1 - The first set
 * @param s2 - The second set
 * @returns A new Set containing all elements from both sets
 */
export const union = <T>(s1: ReadonlySet<T>, s2: ReadonlySet<T>): Set<T> => {
  const result = new Set(s1);
  for (const x of s2) {
    result.add(x);
  }
  return result;
};

/**
 * Returns a new Set containing only elements that exist in both sets.
 *
 * @param s1 - The first set
 * @param s2 - The second set
 * @returns A new Set containing elements present in both sets
 */
export const intersection = <T>(s1: ReadonlySet<T>, s2: ReadonlySet<T>): Set<T> =>
  filter(s1, (x) => contains(s2, x));

/**
 * Returns a new Set containing elements in s1 that are not in s2.
 * Also known as set difference or relative complement.
 *
 * @param s1 - The first set
 * @param s2 - The set to subtract
 * @returns A new Set containing elements in s1 but not in s2
 */
export const difference = <T>(s1: ReadonlySet<T>, s2: ReadonlySet<T>): Set<T> =>
  filter(s1, (x) => !contains(s2, x));

/**
 * Returns a new Set containing elements that exist in either set but not in both.
 * Also known as symmetric difference or disjunctive union.
 *
 * @param s1 - The first set
 * @param s2 - The second set
 * @returns A new Set containing elements in either set but not in both
 * @example
 * ```typescript
 * const a = HashSet.make(1, 2, 3);
 * const b = HashSet.make(2, 3, 4);
 * const result = HashSet.symmetricDifference(a, b);
 * // Set { 1, 4 } (elements in either but not both)
 * ```
 */
export const symmetricDifference = <T>(s1: ReadonlySet<T>, s2: ReadonlySet<T>): Set<T> => {
  const result = new Set<T>();
  for (const x of s1) {
    if (!s2.has(x)) {
      result.add(x);
    }
  }
  for (const x of s2) {
    if (!s1.has(x)) {
      result.add(x);
    }
  }
  return result;
};

/**
 * Tests whether s1 is a subset of s2 (all elements of s1 are in s2).
 *
 * @param s1 - The potential subset
 * @param s2 - The potential superset
 * @returns true if s1 is a subset of s2, false otherwise
 */
export const isSubsetOf = <T>(s1: ReadonlySet<T>, s2: ReadonlySet<T>): boolean =>
  forall(s1, (x) => contains(s2, x));

/**
 * Tests whether s1 is a superset of s2 (all elements of s2 are in s1).
 *
 * @param s1 - The potential superset
 * @param s2 - The potential subset
 * @returns true if s1 is a superset of s2, false otherwise
 */
export const isSupersetOf = <T>(s1: ReadonlySet<T>, s2: ReadonlySet<T>): boolean =>
  isSubsetOf(s2, s1);

/**
 * Tests whether two sets have no elements in common.
 *
 * @param s1 - The first set
 * @param s2 - The second set
 * @returns true if the sets have no common elements, false otherwise
 */
export const isDisjointFrom = <T>(s1: ReadonlySet<T>, s2: ReadonlySet<T>): boolean =>
  !exists(s1, (x) => contains(s2, x));

// ============================================================================
// Transformations
// ============================================================================

/**
 * Transforms each element of the set using the provided function and returns a new set.
 * Note: If the transformation function produces duplicate values, only one will be kept
 * in the resulting set (as per Set behavior).
 *
 * @param set - The set to transform
 * @param f - The transformation function
 * @returns A new Set containing the transformed elements
 */
export const map = <T, U>(set: ReadonlySet<T>, f: SetMorphism<T, U>): Set<U> => {
  const result = new Set<U>();
  for (const x of set) {
    result.add(f(x));
  }
  return result;
};

/**
 * Creates a new Set containing only the elements that satisfy the predicate.
 * Supports type guard predicates for narrowing the type.
 *
 * @param set - The set to filter
 * @param pred - The predicate function to test each element
 * @returns A new Set containing only elements that satisfy the predicate
 */
export const filter: {
  <T, U extends T>(set: ReadonlySet<T>, pred: SetGuardPredicate<T, U>): Set<U>;
  <T>(set: ReadonlySet<T>, pred: SetPredicate<T>): Set<T>;
} = <T>(set: ReadonlySet<T>, pred: SetPredicate<T>): Set<T> => {
  const result = new Set<T>();
  for (const x of set) {
    if (pred(x)) {
      result.add(x);
    }
  }
  return result;
};

/**
 * Splits a set into two sets based on a predicate function.
 * Elements that satisfy the predicate go into the 'pass' set,
 * elements that don't go into the 'fail' set.
 *
 * @param set - The set to partition
 * @param pred - The predicate function to test each element
 * @returns An object with two Sets: 'pass' and 'fail'
 * @example
 * ```typescript
 * const numbers = HashSet.make(1, 2, 3, 4, 5, 6);
 * const { pass, fail } = HashSet.partition(numbers, (x) => x % 2 === 0);
 * // pass: Set { 2, 4, 6 }, fail: Set { 1, 3, 5 }
 * ```
 */
export const partition = <T>(set: ReadonlySet<T>, pred: SetPredicate<T>): { pass: Set<T>; fail: Set<T> } => {
  const pass = new Set<T>();
  const fail = new Set<T>();
  for (const x of set) {
    const target = pred(x) ? pass : fail;
    target.add(x);
  }
  return { pass, fail };
};

/**
 * Maps a function over the set and flattens the result.
 * Similar to flatMap in other functional libraries.
 *
 * @param set - The set to transform
 * @param f - A function that transforms each element into a Set
 * @returns A new Set containing all elements from all resulting Sets
 */
export const bind = <T, U>(set: ReadonlySet<T>, f: SetMorphism<T, ReadonlySet<U>>): Set<U> => {
  const result = new Set<U>();
  for (const x of set) {
    const inner = f(x);
    for (const y of inner) {
      result.add(y);
    }
  }
  return result;
};
// flatten(map(set, f));

// ============================================================================
// Iteration & Traversal
// ============================================================================

/**
 * Executes a function for each element in the set.
 * This function is for side effects only and does not return a value.
 *
 * @param set - The set to iterate over
 * @param f - The function to execute for each element
 */
export const each = <T>(set: ReadonlySet<T>, f: SetMorphism<T, void>): void => {
  for (const x of set) {
    f(x);
  }
};

/**
 * Reduces a set to a single value by applying a function to each element and an accumulator.
 * Processes elements in insertion order.
 *
 * @param set - The set to reduce
 * @param f - The reducer function that takes the accumulator and current element
 * @param acc - The initial accumulator value
 * @returns The final accumulated value
 */
export const foldl = <T, U>(set: ReadonlySet<T>, f: (acc: U, x: T) => U, acc: U): U => {
  each(set, (x) => {
    acc = f(acc, x);
  });
  return acc;
};

// ============================================================================
// Searching
// ============================================================================

/**
 * Finds the first element in the set that satisfies the predicate.
 * Supports type guard predicates for narrowing the type.
 *
 * @param set - The set to search
 * @param pred - The predicate function to test each element
 * @returns Optional.some(element) if found, Optional.none() otherwise
 */
export const find: {
  <T, U extends T>(set: ReadonlySet<T>, pred: SetGuardPredicate<T, U>): Optional<U>;
  <T>(set: ReadonlySet<T>, pred: SetPredicate<T>): Optional<T>;
} = <T>(set: ReadonlySet<T>, pred: SetPredicate<T>): Optional<T> => {
  for (const x of set) {
    if (pred(x)) {
      return Optional.some(x);
    }
  }
  return Optional.none();
};

/**
 * Maps a function over the set and returns the first Some result.
 * Useful for searching and transforming in a single operation.
 *
 * @param set - The set to search and transform
 * @param f - A function that returns Optional<B> for each element
 * @returns The first Some result, or Optional.none() if no element produces a Some
 */
export const findMap = <A, B>(set: ReadonlySet<A>, f: (a: A) => Optional<B>): Optional<B> => {
  for (const x of set) {
    const r = f(x);
    if (r.isSome()) {
      return r;
    }
  }
  return Optional.none<B>();
};

