import * as Type from './Type';

/**
 * The `Optional` type represents a value (of any type) that potentially does
 * not exist. Any `Optional<T>` can either be a `Some<T>` (in which case the
 * value does exist) or a `None` (in which case the value does not exist). This
 * file defines a whole lot of FP-inspired utility functions for dealing with
 * `Optional` objects. Note: Functions are grouped based on, primarily, their
 * Haskell roots. That said, I'm not a Haskell programmer so it might be
 * imperfect.
 *
 * Comparison with null or undefined
 * - We don't get fancy null coalescing operators with `Optional`
 * - We do get fancy helper functions with `Optional`
 * - `Optional` support nesting, and allow for the type to still be nullable (or
 * another `Optional`)
 * - There is no option to turn off strict-optional-checks like there is for
 * strict-null-checks
 * - Try to use `Optional` instead of null or undefined where you can
 */

export class Optional<T> {
  private readonly tag: boolean;
  private readonly value?: T;

  // Sneaky optimisation: every instance of Optional.none is identical, so just
  // reuse the same object
  private static singletonNone = new Optional<any>(false);

  // The internal representation has an `tag` and a `value`, but both are
  // private: able to be console.logged, but not able to be accessed by code
  private constructor(tag: boolean, value?: T) {
    this.tag = tag;
    this.value = value;
  }

  // --- Identities ---

  /**
   * Creates a new Optional<T> that **does** contain a value.
   */
  public static some<T>(this: void, value: T): Optional<T> {
    return new Optional(true, value);
  }

  /**
   * Create a new Optional<T> that **does not** contain a value. T can be any
   * type because we don't actually have a T.
   */
  public static none<T = never>(this: void): Optional<T> {
    return Optional.singletonNone;
  }

  /**
   * Perform a transform on an Optional type. Similar to the fold method on a
   * number of ADTs in the TinyMCE codebase, you pass two functions into this -
   * if `self` **does not** contain a value then `onNone` will be called (with
   * no argument) but if `self` **does** contain a value then `onSome` will be
   * called (with the value as its argument).
   *
   * For the FP enthusiasts in the room, this function:
   * 1. Could be used to implement all of the functions below
   * 2. Forms a catamorphism
   */
  public fold<U>(onNone: () => U, onSome: (value: T) => U): U {
    if (this.tag) {
      return onSome(this.value as T);
    } else {
      return onNone();
    }
  }

  /**
   * Determine if this Optional object contains a value.
   */
  public isSome(): boolean {
    return this.tag;
  }

  /**
   * Determine if this Optional object **does not** contain a value.
   */
  public isNone(): boolean {
    return !this.tag;
  }

  // --- Functor ---

  /**
   * Perform a transform on an Optional object, **if** there is a value. If you
   * provide a function to turn a T into a U, this is the function you use to
   * turn an `Optional<T>` into an `Optional<U>`. If self **does** contain a
   * value then the output will also contain a value (that value being the
   * output of `mapper(self.value)`), and if self **does not** contain a value
   * then neither will the output.
   */
  public map<U>(mapper: (value: T) => U): Optional<U> {
    if (this.tag) {
      return Optional.some(mapper(this.value as T));
    } else {
      return Optional.none();
    }
  }

  // --- Monad ---

  /**
   * Perform a transform on an Optional object, **if** there is a value. Unlike
   * the map function earlier in the piece, here the transform itself also
   * returns an Optional.
   */
  public bind<U>(binder: (value: T) => Optional<U>): Optional<U> {
    if (this.tag) {
      return binder(this.value as T);
    } else {
      return Optional.none();
    }
  }

  // --- Traversable ---

  /**
   * For a given predicate, this function finds out if there **exists** a value
   * inside this Optional object that meets the predicate. In practice, this
   * means that for empty objects it returns false (as no predicate-meeting
   * object exists).
   */
  public exists(predicate: (value: T) => boolean): boolean {
    return this.tag && predicate(this.value as T);
  }

  /**
   * For a given predicate, this function finds out if **all** the values inside
   * this maybe object meet the predicate. In practice, this means that for
   * empty objects it returns true (as all 0 objects do meet the predicate).
   */
  public forall(predicate: (value: T) => boolean): boolean {
    return !this.tag || predicate(this.value as T);
  }

  /**
   * For a given predicate, create a new Optional object that will retain all
   * the values inside the old Optional object that meet the predicate. In
   * practice, the Optional object contains either 0 or 1 objects, and the
   * output will keep the (single) input object (if it exists) as long as it
   * passes the predicate.
   */
  public filter<U extends T>(predicate: (value: T) => value is U): Optional<U>;
  public filter(predicate: (value: T) => boolean): Optional<T>;
  public filter(predicate: (value: T) => boolean): Optional<T> {
    if (!this.tag || predicate(this.value as T)) {
      return this;
    } else {
      return Optional.none();
    }
  }

  // --- Getters ---

  /**
   * Get the value out of the inside of the Optional object, using a default
   * `replacement` value if the provided Optional object does not contain a
   * value.
   */
  public getOr<U = T>(replacement: U): T | U {
    return this.tag ? this.value as T : replacement;
  }

  /**
   * Get the value out of the inside of the Optional object, using a default
   * `replacement` value if the provided Optional object does not contain a
   * value.  Unlike `getOr`, in this method the `replacement` object is also
   * Optional - meaning that this method will always return an Optional.
   */
  public or<U = T>(replacement: Optional<U>): Optional<T | U> {
    return this.tag ? this : replacement;
  }

  /**
   * Get the value out of the inside of the Optional object, using a default
   * `replacement` value if the provided Optional object does not contain a
   * value. Unlike `getOr`, in this method the `replacement` value is "thunked"
   * - that is to say that you don't pass a value to `getOrThunk`, you pass a
   * function which (if called) will **return** the `value` you want to use.
   */
  public getOrThunk<U = T>(thunk: () => U): T | U {
    return this.tag ? this.value as T : thunk();
  }

  /**
   * Get the value out of the inside of the Optional object, using a default
   * `replacement` value if the provided Optional object does not contain a
   * value.
   *
   * Unlike `or`, in this method the `replacement` value is "thunked" - that is
   * to say that you don't pass a value to `getOrThunk`, you pass a function
   * which (if called) will **return** the `value` you want to use.
   *
   * Unlike `getOrThunk`, in this method the `replacement` value is also
   * Optional, meaning that this method will always return an Optional.
   */
  public orThunk<U = T>(thunk: () => Optional<U>): Optional<T | U> {
    return this.tag ? this : thunk();
  }

  /**
   * Get the value out of the inside of the Optional object, throwing an
   * exception if the provided Optional object does not contain a value.
   *
   * WARNING:
   * You should only be using this function if you know that the Optional
   * object **is not** empty (otherwise you're throwing exceptions in production
   * code, which is bad).
   *
   * Prefer other methods to this, such as `.each`.
   */
  public getOrDie(message?: string): T {
    if (!this.tag) {
      throw new Error(message ?? 'Called getOrDie on None');
    } else {
      return this.value as T;
    }
  }

  // --- Interop with null and undefined ---

  /**
   * Creates an Optional value from a nullable (or undefined-able) input. Null,
   * or undefined, is converted to None, and anything else is converted to Some.
   */
  public static from<T>(this: void, value: T | null | undefined): Optional<NonNullable<T>> {
    return Type.isNonNullable(value) ? Optional.some(value) : Optional.none();
  }

  /**
   * Converts an Optional to a nullable type.
   */
  public getOrNull(): T | null {
    return this.tag ? this.value as T : null;
  }

  /**
   * Converts an Optional to an undefined-able type.
   */
  public getOrUndefined(): T | undefined {
    return this.tag ? this.value as T : undefined;
  }

  // -- Utilities --

  /**
   * If the Optional contains a value, perform an action on that value. Unlike
   * the rest of the methods on this type, `.each` has side-effects. If you want
   * to transform an Optional<T> **into** something, then this is not the method
   * for you. If you want to use an Optional<T> to **do** something, then this
   * is the method for you - provided you're okay with not doing anything in the
   * case where the Optional doesn't have a value inside it. If you're not sure
   * whether your use-case fits into transforming **into** something or
   * **doing** something, check whether it has a return value. If it does,
   * you're looking at a transform.
   */
  public each(worker: (value: T) => void): void {
    if (this.tag) {
      worker(this.value as T);
    }
  }

  public toArray(): T[] {
    return this.tag ? [ this.value as T ] : [];
  }

  public toString(): string {
    return this.tag ? `some(${this.value})` : 'none()';
  }
}
