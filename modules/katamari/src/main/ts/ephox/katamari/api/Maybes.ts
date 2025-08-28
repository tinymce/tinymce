import * as Fun from './Fun';
import { Optional } from './Optional';
import * as Type from './Type';

/**
 The `Maybe` type represents a value (of any type) that potentially does not
 exist. Any `Maybe<T>` can either be a `Just<T>` (in which case the value does
 exist, and can be accessed as `.value`) or a `Nothing` (in which case the
 value does not exist). This file defines a whole lot of FP-inspired utility
 functions for dealing with Maybe objects. Things to note:
 1. Functions are grouped based on, primarily, their Haskell roots. That
 said, I'm not a Haskell programmer so it might be imperfect.
 2. Many of the functions are "curried". This means that they take all of
 their arguments that are not the Maybe object first, and then they return a
 function that takes the Maybe object and actually performs the operation.
 This is done to make the functions easier to use with Fun.pipe, so that code
 can be written left to right.

 Comparison with null or undefined
 - We don't get fancy null coalescing operators with Maybe
 - We do get fancy helper functions with Maybe
 - Maybes support nesting, and allow for the type to still be nullable (or
 another Maybe)
 - There is no option to turn off strict-maybe-checks like there is for
 strict-null-checks
 - Try to use Maybe instead of null or undefined where you can

 Comparison with Optional
 - Optional uses a.method().method(), Maybe uses Fun.pipe(a, method(), method())
 - Optional is invariant, Maybe is covariant (Maybe<Dog> counts as a
 Maybe<Animal> but Optional<Dog> does not count as Optional<Animal>)
 - Maybe tree-shakes and minifies a lot better
 - Maybe can be `console.log`ed
 - Maybe might perform better because it doesn't need to create messy objects
 - Optional is deprecated (but still in very wide use) and you should try to
 migrate over to Maybe where you can
*/

// --- Types ---

/**
 Technically, this will compile down to 0 for Nothing, and 1 for Just. If
 you're logging a `Maybe<T>` and you see some 1s and 0s where you expected to
 see useful strings, this is why. This should minify better.
*/
export const enum Tag {
  Nothing,
  Just
}

export interface Nothing {
  readonly tag: Tag.Nothing;
}

export interface Just<T> {
  readonly tag: Tag.Just;
  readonly value: T;
}

/**
 Not exported, instead duplicated in Maybe.ts as an identical type to make
 imports nice for consumers. Redefined here to avoid looped imports.
*/
type Maybe<T> = Nothing | Just<T>;

// --- Identities ---

/**
 Just a small optimisation - all nothing objects are identical, why not make
 them point to the same object?
*/
const singletonNothing: Nothing = { tag: Tag.Nothing };

/**
 Create a new Maybe<T> that **does not** contain a value. T can be any type
 (and defaults to the literal any type) because we don't actually have a T.
*/
export const nothing = <T = any>(): Maybe<T> => singletonNothing;

/**
 Creates a new Maybe<T> that **does** contain a value.
*/
export const just = <T>(value: T): Maybe<T> => ({
  tag: Tag.Just,
  value
});

/**
 Perform a transform on a Maybe type. Similar to the fold method on a number
 of ADTs in the TinyMCE codebase, you pass two functions into this - if `self`
 **does not** contain a value then `onNothing` will be called (with no
 argument) but if `self` **does** contain a value then `onJust` will be
 called (with the value as its argument).

 For the FP enthusiasts in the room, this function:
 1. Could be used to implement all of the functions below (although it isn't)
 2. Forms a catamorphism
*/
export const fold = <T, U>(onNothing: () => U, onJust: (value: T) => U) => (self: Maybe<T>): U => {
  switch (self.tag) {
    case Tag.Nothing:
      return onNothing();
    case Tag.Just:
      return onJust(self.value);
  }
};

/**
 Determine if this Maybe object **does not** contain a value.
*/
export const isNothing = <T>(self: Maybe<T>): self is Nothing => self.tag === Tag.Nothing;

/**
 Determine if this Maybe object contains a value. If this function returns
 true, you can access the value using `.value` on the object directly.
*/
export const isJust = <T>(self: Maybe<T>): self is Just<T> => self.tag === Tag.Just;

// --- Functor ---

/**
 Perform a transform on a Maybe object, **if** there is a value. If you
 provide a function to turn a T into a U, this is the function you use to turn
 a `Maybe<T>` into a `Maybe<U>`. If self **does** contain a value then the
 output will also contain a value (that value being the output of
 `mapper(self.value)`), and if self **does not** contain a value then
 neither will the output.
*/
export const map = <T, U>(mapper: (value: T) => U) => (self: Maybe<T>): Maybe<U> =>
  isJust(self) ? just(mapper(self.value)) : nothing<U>();

// --- Applicative ---

/**
 Perform a transform on two Maybe objects, **if** they both have values. If
 either of the objects does not contain a value, this will return an empty
 Maybe (nothing), but if all of the input objects do have a value then `fn`
 will be called (with all of those values as its arguments) and the output
 will be wrapped in another Maybe.
*/
export const lift2 = <A, B, R>(a: Maybe<A>, b: Maybe<B>, fn: (a: A, b: B) => R): Maybe<R> => {
  if (isJust(a) && isJust(b)) {
    return just(fn(a.value, b.value));
  } else {
    return nothing<R>();
  }
};

/**
 Same as lift2, but with 3 maybe objects.
*/
export const lift3 = <A, B, C, R>(a: Maybe<A>, b: Maybe<B>, c: Maybe<C>, fn: (a: A, b: B, c: C) => R): Maybe<R> => {
  if (isJust(a) && isJust(b) && isJust(c)) {
    return just(fn(a.value, b.value, c.value));
  } else {
    return nothing<R>();
  }
};

/**
 Same as lift2, but with 4 maybe objects.
*/
export const lift4 = <A, B, C, D, R>(
  a: Maybe<A>,
  b: Maybe<B>,
  c: Maybe<C>,
  d: Maybe<D>,
  fn: (a: A, b: B, c: C, d: D) => R
): Maybe<R> => {
  if (isJust(a) && isJust(b) && isJust(c) && isJust(d)) {
    return just(fn(a.value, b.value, c.value, d.value));
  } else {
    return nothing<R>();
  }
};

/**
 Same as lift2, but with 5 maybe objects.
*/
export const lift5 = <A, B, C, D, E, R>(
  a: Maybe<A>,
  b: Maybe<B>,
  c: Maybe<C>,
  d: Maybe<D>,
  e: Maybe<E>,
  fn: (a: A, b: B, c: C, d: D, e: E) => R
): Maybe<R> => {
  if (isJust(a) && isJust(b) && isJust(c) && isJust(d) && isJust(e)) {
    return just(fn(a.value, b.value, c.value, d.value, e.value));
  } else {
    return nothing<R>();
  }
};

// --- Monad ---

/**
 Un-nests a Maybe type. Conversion is as follows:
 Nothing ==> Nothing
 Just(Nothing) ==> Nothing
 Just(Just(T)) ==> Just(T)

 You shouldn't often end up with nested Maybe types to need this function, but
 if you do it's here.
*/
export const flatten = <T>(self: Maybe<Maybe<T>>): Maybe<T> =>
  isJust(self) ? self.value : nothing<T>();

/**
 Perform a transform on a Maybe object, **if** there is a value. Unlike the
 map function earlier in the piece, here the transform itself also returns a
 Maybe. Think of this like a combination of `map` and `flatten` at the same
 time.
*/
export const bind = <T, U>(binder: (value: T) => Maybe<U>) => (self: Maybe<T>): Maybe<U> =>
  isJust(self) ? binder(self.value) : nothing<U>();

// --- Traversable ---

/**
 For a given predicate, this function finds out if there **exists** a value
 inside this Maybe object that meets the predicate. In practice, this means
 that for empty objects it returns false (as no predicate-meeting object
 exists).
*/
export const exists = <T>(predicate: (value: T) => boolean) => (self: Maybe<T>): boolean =>
  isJust(self) && predicate(self.value);

/**
 For a given predicate, this function finds out if **all** the values inside
 this maybe object meet the predicate. In practice, this means that for empty
 objects it returns true (as all 0 objects do meet the predicate).
*/
export const forall = <T>(predicate: (value: T) => boolean) => (self: Maybe<T>): boolean =>
  isNothing(self) || predicate(self.value);

/**
 For a given predicate, create a new Maybe object that will retain all the
 values inside the old Maybe object that meet the predicate. In practice, the
 Maybe object contains either 0 or 1 objects, and the output will keep the
 (single) input object (if it exists) as long as it passes the predicate.
*/
export const filter: {
  <T, U extends T>(predicate: (value: T) => value is U): (self: Maybe<T>) => Maybe<U>;
  <T>(predicate: (value: T) => boolean): (self: Maybe<T>) => Maybe<T>;
} = <T>(predicate: (value: T) => boolean) => (self: Maybe<T>) => {
  if (isJust(self) && predicate(self.value)) {
    return just(self.value);
  } else {
    return nothing();
  }
};

// --- Getters ---

/**
 Get the value out of the inside of the Maybe object, using a default
 `replacement` value if the provided Maybe object does not contain a value.
*/
export const getOr = <T, U = T>(replacement: U) => (self: Maybe<T>): T | U =>
  isJust(self) ? self.value : replacement;

/**
 Get the value out of the inside of the Maybe object, throwing an exception if
 the provided Maybe object does not contain a value.

 WARNING:
 1. You should only be using this function if you know that the Maybe object
 **is not** empty (otherwise you're throwing exceptions in production code,
 which is bad).
 2. If you know that the Maybe object is not empty, then TypeScript should
 also know that the Maybe object is not empty (comparison operations on `.tag`
 as well as the `isJust` method will both allow the compiler to infer that the
 object is not empty).
 3. If TypeScript knows that the Maybe object is not empty, it will let you
 just access `.value` directly, without needing this function + without
 risking an exception being thrown.

 Therefore, you should only be calling this function in environments where
 you're unable to completely type-check your code (IE: tests). In all other
 situations, **avoid this method**.
*/
export const getOrDie = <T>(self: Maybe<T>): T => {
  if (isNothing(self)) {
    throw new Error('Called getOrDie on Nothing');
  }

  return self.value;
};

/**
 Get the value out of the inside of the Maybe object, using a default
 `replacement` value if the provided Maybe object does not contain a value.
 Unlike `getOr`, in this method the `replacement` value is "thunked" - that is
 to say that you don't pass a value to `getOrThunk`, you pass a function which
 (if called) will **return** the `value` you want to use.
*/
export const getOrThunk = <T, U = T>(thunk: () => U) => (self: Maybe<T>): T | U =>
  isJust(self) ? self.value : thunk();

// --- Comparators ---

/**
 **Is** the value stored inside this Maybe object equal to `other`?
*/
export const is = <T>(other: T, comparator: (a: T, b: T) => boolean = Fun.tripleEquals) => (self: Maybe<T>): boolean =>
  isJust(self) && comparator(self.value, other);

/**
 Are these two Maybe objects equal? Equality here means either they're both
 `Just` (and the values are equal under the comparator) or they're both
 `Nothing`.
*/
export const equals: {
  <T, U>(lhs: Maybe<T>, rhs: Maybe<U>, comparator: (lhs: T, rhs: U) => boolean): boolean;
  <T>(lhs: Maybe<T>, rhs: Maybe<T>, comparator?: (lhs: T, rhs: T) => boolean): boolean;
} = <T>(lhs: Maybe<T>, rhs: Maybe<T>, comparator: (lhs: T, rhs: T) => boolean = Fun.tripleEquals) => {
  if (isJust(lhs) && isJust(rhs)) {
    return comparator(lhs.value, rhs.value);
  } else {
    return lhs.tag === rhs.tag;
  }
};

// --- Interop with null and undefined ---

/**
 Creates a Maybe value from a nullable (or undefined-able) input. Null, or
 undefined, is converted to Nothing, and anything else is converted to Just.
*/
export const from = <T>(input: T | null | undefined): Maybe<NonNullable<T>> => {
  if (Type.isNonNullable(input)) {
    return just(input);
  } else {
    return nothing<NonNullable<T>>();
  }
};

/**
 Converts a Maybe to a nullable type.
*/
export const getOrNull: <T>(self: Maybe<T>) => T | null = getOr(null);

/**
 Converts a Maybe to an undefined-able type.
*/
export const getOrUndefined: <T>(self: Maybe<T>) => T | undefined = getOr(undefined);

/**
 This is just like `bind`, but instead of the `binder` returning a `Maybe<U>`,
 it returns a nullable (or undefined-able) `U`. This is just a little bit of
 sugar so that if you have a function which is designed to work with nullable
 (or undefined-able) return types, you don't need to wrap it to use it with
 bind.
*/
export const bindNullable = <T, U>(binder: (value: T) => U | null | undefined) => (self: Maybe<T>): Maybe<NonNullable<U>> =>
  isJust(self) ? from(binder(self.value)) : nothing<NonNullable<U>>();

// --- Interop with other Katamari modules ---

/**
 Convert a Maybe object to an array. Empty Maybe - empty array. Non-empty Maybe - non-empty array.
*/
export const toArr = <T>(self: Maybe<T>): T[] =>
  isJust(self) ? [ self.value ] : [];

/**
 Convert a Maybe object to an Optional object. Just === Some, and Nothing === None
*/
export const toOptional = <T>(self: Maybe<T>): Optional<T> =>
  isJust(self) ? Optional.some(self.value) : Optional.none();

/**
 Convert an Optional object to a Maybe object. Some === Just, and None === Nothing.
*/
export const fromOptional = <T>(other: Optional<T>): Maybe<T> =>
  other.fold(nothing, just);

/**
 This is just like `bind`, but instead of the `binder` returning a `Maybe<U>`,
 it returns an `Optional<U>`. This is just a little bit of sugar so that if
 you have a function which is designed to work with `Optional` return types,
 you don't need to wrap it to use it with bind.
*/
export const bindO = <T, U>(binder: (value: T) => Optional<U>) => (self: Maybe<T>): Maybe<U> =>
  isJust(self) ? fromOptional(binder(self.value)) : nothing<U>();
