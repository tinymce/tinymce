import * as Fun from './Fun';
import { Optional } from './Optional';
import { Result } from './Result';

/**
 * The `ResultAsync` type represents an asynchronous computation that may either
 * succeed with a value (of type `T`) or fail with an error (of type `E`). It
 * wraps a `Promise<Result<T, E>>` and provides a rich API for composing
 * asynchronous operations while maintaining type safety for both success and
 * error cases.
 *
 * This is the asynchronous counterpart to the `Result` type, allowing you to
 * chain operations on promises that might fail without needing to manually
 * handle promise rejection and Result unwrapping at each step.
 *
 * Key benefits:
 * - Eliminates the need for try/catch blocks around async operations
 * - Provides a functional programming style for handling async operations
 * - Maintains type safety for both success and error paths
 * - Allows for easy composition of multiple async operations
 * - Converts uncaught promise rejections into typed errors
 */
export interface ResultAsync<T, E> extends PromiseLike<Result<T, E>> {
  // --- Identities ---

  /**
   * Transform a `ResultAsync` type into a `Promise` of type `U`. This method
   * allows you to handle both success and error cases and convert the result
   * into a single type. The promise will resolve to the result of calling
   * either `onError` or `onValue` depending on the state of the ResultAsync.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.fromPromise(
   *   fetchUser('123'),
   *   err => `Fetch error: ${err}`
   * );
   *
   * const message = await userResult.fold(
   *   error => `Failed: ${error}`,
   *   user => `Welcome, ${user.name}!`
   * );
   * // Result: "Welcome, Alice!" or "Failed: Fetch error: Network timeout"
   * ```
   */
  readonly fold: <U>(
    onError: (error: E) => U | Promise<U>,
    onValue: (value: T) => U | Promise<U>
  ) => Promise<U>;

  // --- Functor ---

  /**
   * Transform the success value of a `ResultAsync` if one exists. This method
   * applies the mapper function to the value inside a successful ResultAsync,
   * producing a new ResultAsync with the transformed value. If the original
   * ResultAsync contains an error, the error passes through unchanged.
   *
   * The mapper function can return either a synchronous value or a Promise.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30 });
   *
   * const upperCaseName = await userResult
   *   .map(user => user.name.toUpperCase())
   *   .getOr('UNKNOWN');
   * // Result: "ALICE"
   *
   * // With async mapper
   * const enrichedUser = userResult
   *   .map(async user => ({
   *     ...user,
   *     profile: await fetchUserProfile(user.id)
   *   }));
   * ```
   */
  readonly map: <U>(mapper: (value: T) => U | Promise<U>) => ResultAsync<U, E>;

  /**
   * Transform the error value of a `ResultAsync` if one exists. This method
   * applies the mapper function to the error inside a failed ResultAsync,
   * producing a new ResultAsync with the transformed error. If the original
   * ResultAsync contains a value, the value passes through unchanged.
   *
   * The mapper function can return either a synchronous error or a Promise.
   *
   * @example
   * ```typescript
   * const errorResult = ResultAsync.error('Network timeout');
   *
   * const enhancedError = await errorResult
   *   .mapError(err => ({ type: 'NETWORK_ERROR', message: err, timestamp: Date.now() }))
   *   .fold(
   *     error => `Error: ${error.type} - ${error.message}`,
   *     value => `Success: ${value}`
   *   );
   * // Result: "Error: NETWORK_ERROR - Network timeout"
   *
   * // With async mapper
   * const loggedError = errorResult
   *   .mapError(async err => {
   *     await logErrorToService(err);
   *     return { original: err, logged: true };
   *   });
   * ```
   */
  readonly mapError: <F>(
    mapper: (error: E) => F | Promise<F>
  ) => ResultAsync<T, F>;

  // --- Monad ---

  /**
   * Chain multiple async operations together. If this ResultAsync contains a
   * value, the binder function will be called with that value and should
   * return either a `Result` or another `ResultAsync`. If this ResultAsync
   * contains an error, the binder function will not be called and the error
   * will propagate through.
   *
   * This is useful for sequencing multiple operations that might fail.
   *
   * @example
   * ```typescript
   * const fetchUserChain = ResultAsync.fromPromise(
   *   fetchUser('123'),
   *   err => `User fetch failed: ${err}`
   * );
   *
   * const userWithPermissions = fetchUserChain
   *   .bind(user => ResultAsync.fromPromise(
   *     fetchPermissions(user.id),
   *     err => `Permissions fetch failed: ${err}`
   *   ))
   *   .bind(permissions => ResultAsync.fromPromise(
   *     validateAccess(permissions),
   *     err => `Access validation failed: ${err}`
   *   ));
   *
   * const result = await userWithPermissions.getOr(null);
   * // Result: validated permissions object or null if any step failed
   * ```
   */
  readonly bind: <U, F>(
    binder: (value: T) => Result<U, F> | ResultAsync<U, F>
  ) => ResultAsync<U, E | F>;

  // --- Traversable ---

  /**
   * Check if there exists a value inside this `ResultAsync` that satisfies
   * the given predicate. Returns a Promise that resolves to true if the
   * ResultAsync contains a value that meets the predicate, false otherwise.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30, isActive: true });
   *
   * const hasActiveUser = await userResult.exists(user => user.isActive);
   * // Result: true
   *
   * const hasAdultUser = await userResult.exists(user => user.age >= 18);
   * // Result: true
   *
   * const errorResult = ResultAsync.error('No user found');
   * const errorExists = await errorResult.exists(user => user.isActive);
   * // Result: false (no value to check)
   *
   * // With async predicate
   * const hasValidEmail = await userResult.exists(async user => {
   *   return await validateEmail(user.email);
   * });
   * ```
   */
  readonly exists: (
    predicate: (value: T) => boolean | Promise<boolean>
  ) => Promise<boolean>;

  /**
   * Check if all values inside this `ResultAsync` satisfy the given predicate.
   * Returns a Promise that resolves to true if the ResultAsync contains a
   * value that meets the predicate (or contains an error), false otherwise.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30, isActive: true });
   *
   * const isValidUser = await userResult.forall(user => user.age >= 18 && user.isActive);
   * // Result: true
   *
   * const isAdminUser = await userResult.forall(user => user.role === 'admin');
   * // Result: false (Alice is not an admin)
   *
   * const errorResult = ResultAsync.error('No user found');
   * const errorForall = await errorResult.forall(user => user.isActive);
   * // Result: true (vacuously true - no value to violate the predicate)
   *
   * // With async predicate
   * const hasValidCredentials = await userResult.forall(async user => {
   *   return await validateCredentials(user.id);
   * });
   * ```
   */
  readonly forall: (
    predicate: (value: T) => boolean | Promise<boolean>
  ) => Promise<boolean>;

  // --- Getters ---

  /**
   * Get the value from this `ResultAsync`, using the provided replacement if
   * this ResultAsync contains an error. Returns a Promise that resolves to
   * either the success value or the replacement value.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30 });
   * const defaultUser = { name: 'Guest', age: 0 };
   *
   * const user = await userResult.getOr(defaultUser);
   * // Result: { name: 'Alice', age: 30 }
   *
   * const errorResult = ResultAsync.error('User not found');
   * const fallbackUser = await errorResult.getOr(defaultUser);
   * // Result: { name: 'Guest', age: 0 }
   *
   * // With different types
   * const messageResult = ResultAsync.error('Failed to load');
   * const message = await messageResult.getOr('Default message');
   * // Result: "Default message"
   * ```
   */
  readonly getOr: <T2 = T>(replacement: T2) => Promise<T | T2>;

  /**
   * Get a `ResultAsync` from this `ResultAsync`, using the provided replacement
   * if this ResultAsync contains an error. The replacement can be either a
   * `Result` or another `ResultAsync`.
   *
   * @example
   * ```typescript
   * const primaryResult = ResultAsync.error('Primary service down');
   * const fallbackResult = ResultAsync.value({ source: 'fallback', data: 'backup data' });
   *
   * const finalResult = await primaryResult
   *   .or(fallbackResult)
   *   .getOr({ source: 'default', data: 'default data' });
   * // Result: { source: 'fallback', data: 'backup data' }
   *
   * // With successful primary
   * const successResult = ResultAsync.value({ source: 'primary', data: 'main data' });
   * const result = await successResult
   *   .or(fallbackResult)
   *   .getOr({ source: 'default', data: 'default data' });
   * // Result: { source: 'primary', data: 'main data' }
   *
   * // Chain multiple fallbacks
   * const chainResult = primaryResult
   *   .or(ResultAsync.error('Fallback also failed'))
   *   .or(ResultAsync.value({ source: 'last-resort', data: 'emergency data' }));
   * ```
   */
  readonly or: <T2 = T, E2 = E>(
    replacement: Result<T2, E2> | ResultAsync<T2, E2>
  ) => ResultAsync<T | T2, E | E2>;

  /**
   * Get the value from this `ResultAsync`, using a lazily-evaluated replacement
   * if this ResultAsync contains an error. The thunk function will only be
   * called if this ResultAsync contains an error.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30 });
   *
   * const user = await userResult.getOrThunk(() => {
   *   console.log('This will not be called since userResult has a value');
   *   return { name: 'Default', age: 0 };
   * });
   * // Result: { name: 'Alice', age: 30 }
   *
   * const errorResult = ResultAsync.error('User not found');
   * const fallbackUser = await errorResult.getOrThunk(() => {
   *   console.log('Computing fallback value...');
   *   return { name: 'Computed Default', age: getCurrentYear() - 2000 };
   * });
   * // Result: { name: 'Computed Default', age: 25 } (assuming current year is 2025)
   *
   * // With async thunk
   * const asyncFallback = await errorResult.getOrThunk(async () => {
   *   return await fetchDefaultUser();
   * });
   * ```
   */
  readonly getOrThunk: <T2 = T>(
    thunk: () => T2 | Promise<T2>
  ) => Promise<T | T2>;

  /**
   * Get a `ResultAsync` from this `ResultAsync`, using a lazily-evaluated
   * replacement if this ResultAsync contains an error. The thunk function will
   * only be called if this ResultAsync contains an error.
   *
   * @example
   * ```typescript
   * const primaryService = ResultAsync.error('Primary API unavailable');
   *
   * const serviceResult = primaryService.orThunk(() => {
   *   console.log('Primary failed, trying fallback...');
   *   return ResultAsync.fromPromise(
   *     fetch('/api/fallback'),
   *     err => `Fallback failed: ${err}`
   *   );
   * });
   *
   * const data = await serviceResult.getOr('No data available');
   *
   * // Multiple fallback levels
   * const robustService = primaryService
   *   .orThunk(() => {
   *     return ResultAsync.fromPromise(
   *       fetchFromFallback1(),
   *       err => `Fallback 1 failed: ${err}`
   *     );
   *   })
   *   .orThunk(() => {
   *     return ResultAsync.fromPromise(
   *       fetchFromFallback2(),
   *       err => `Fallback 2 failed: ${err}`
   *     );
   *   });
   *
   * // With async thunk returning Promise<Result>
   * const asyncFallback = primaryService.orThunk(async () => {
   *   const config = await loadFallbackConfig();
   *   return Result.value(config.defaultData);
   * });
   * ```
   */
  readonly orThunk: <T2 = T, E2 = E>(
    thunk: () => Result<T2, E2> | ResultAsync<T2, E2> | Promise<Result<T2, E2>>
  ) => ResultAsync<T | T2, E | E2>;

  /**
   * Get the value from this `ResultAsync`, throwing an exception if this
   * ResultAsync contains an error instead.
   *
   * WARNING: This method breaks the type safety that ResultAsync provides.
   * Only use this if you are certain the ResultAsync contains a value.
   * Prefer other methods like `.getOr()` or `.fold()`.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30 });
   * const user = await userResult.getOrDie();
   * // Result: { name: 'Alice', age: 30 }
   *
   * const errorResult = ResultAsync.error('User not found');
   * try {
   *   const user = await errorResult.getOrDie();
   *   // This line will never execute
   * } catch (error) {
   *   console.log(error); // Throws: 'User not found'
   * }
   *
   * // Better approach - use getOr instead
   * const safeUser = await errorResult.getOr({ name: 'Guest', age: 0 });
   * // Result: { name: 'Guest', age: 0 } - no exception thrown
   * ```
   */
  readonly getOrDie: () => Promise<T>;

  // --- Utilities ---

  /**
   * Perform a side effect with the value inside this `ResultAsync` if it
   * contains one. This method does not transform the ResultAsync, it only
   * performs side effects. The original ResultAsync is returned unchanged.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30 });
   *
   * const chainedResult = userResult
   *   .each(user => {
   *     console.log(`Processing user: ${user.name}`);
   *     // Perform logging, analytics, etc.
   *   })
   *   .map(user => ({ ...user, processed: true }));
   *
   * const finalUser = await chainedResult.getOr(null);
   * // Console output: "Processing user: Alice"
   * // Result: { name: 'Alice', age: 30, processed: true }
   *
   * const errorResult = ResultAsync.error('No user');
   * const errorChain = errorResult
   *   .each(user => {
   *     console.log('This will not execute');
   *   })
   *   .getOr({ name: 'Default', age: 0 });
   * // No console output, side effect is skipped for errors
   *
   * // With async side effects
   * const asyncSideEffect = userResult
   *   .each(async user => {
   *     await logUserActivity(user.id);
   *     await updateLastSeen(user.id);
   *   });
   * ```
   */
  readonly each: (
    worker: (value: T) => void | Promise<void>
  ) => ResultAsync<T, E>;

  /**
   * Convert this `ResultAsync<T, E>` to a `Promise<Optional<T>>`. If this
   * ResultAsync contains a value, the Promise will resolve to an Optional
   * containing that value. If this ResultAsync contains an error, the Promise
   * will resolve to an empty Optional.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30 });
   * const userOptional = await userResult.toOptional();
   *
   * const name = userOptional
   *   .map(user => user.name)
   *   .getOr('Unknown');
   * // Result: "Alice"
   *
   * const errorResult = ResultAsync.error('User not found');
   * const errorOptional = await errorResult.toOptional();
   *
   * const errorName = errorOptional
   *   .map(user => user.name)
   *   .getOr('Unknown');
   * // Result: "Unknown" (Optional is empty)
   *
   * // Useful for filtering out errors in data processing
   * const results = await Promise.all([
   *   userResult.toOptional(),
   *   errorResult.toOptional(),
   *   ResultAsync.value({ name: 'Bob', age: 25 }).toOptional()
   * ]);
   *
   * const validUsers = results
   *   .filter(opt => opt.isSome())
   *   .map(opt => opt.getOr({ name: 'Unknown', age: 0 }));
   * // Result: [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]
   * ```
   */
  readonly toOptional: () => Promise<Optional<T>>;

  /**
   * Convert this `ResultAsync<T, E>` to a `Promise<Result<T, E>>`. This method
   * returns the internal promise that resolves to a Result, maintaining the
   * error safety that ResultAsync provides.
   *
   * Unlike methods that unwrap the Result and throw errors, this preserves
   * the type safety by keeping the Result wrapper.
   *
   * @example
   * ```typescript
   * const userResult = ResultAsync.value({ name: 'Alice', age: 30 });
   *
   * const result = await userResult.toPromise();
   * if (result.isValue()) {
   *   const user = result.getOr({ name: 'Unknown', age: 0 });
   *   console.log(user.name); // "Alice"
   * } else {
   *   console.log('Error occurred');
   * }
   *
   * const errorResult = ResultAsync.error('User not found');
   *
   * const errorResultValue = await errorResult.toPromise();
   * if (errorResultValue.isError()) {
   *   console.log(errorResultValue.fold(err => err, () => '')); // "User not found"
   * }
   *
   * // Type safety is maintained throughout
   * const safeUser = errorResultValue.getOr({ name: 'Guest', age: 0 });
   * // Result: { name: 'Guest', age: 0 } - no exception handling needed
   * ```
   */
  readonly toPromise: () => Promise<Result<T, E>>;
}

/**
 * Implementation class for ResultAsync. This class is not exported in the
 * public API but provides the concrete implementation.
 */
class ResultAsyncImpl<T, E> implements ResultAsync<T, E> {
  public readonly _promise: Promise<Result<T, E>>;

  public constructor(promise: Promise<Result<T, E>>) {
    this._promise = promise;
  }

  public readonly fold = <U>(
    onError: (error: E) => U | Promise<U>,
    onValue: (value: T) => U | Promise<U>
  ): Promise<U> => {
    return this._promise.then(async (result) => {
      return await result.fold(onError, onValue);
    });
  };

  public readonly map = <U>(
    mapper: (value: T) => U | Promise<U>
  ): ResultAsync<U, E> => {
    const newPromise = this.fold(
      async (err) => {
        return Result.error<U, E>(err);
      },
      async (value) => {
        const mapped = await mapper(value);
        return Result.value<U, E>(mapped);
      }
    );
    return new ResultAsyncImpl(newPromise);
  };

  public readonly mapError = <F>(
    mapper: (error: E) => F | Promise<F>
  ): ResultAsync<T, F> => {
    const newPromise = this.fold(
      async (err) => {
        const mapped = await mapper(err);
        return Result.error<T, F>(mapped);
      },
      async (value) => {
        return Result.value<T, F>(value);
      }
    );
    return new ResultAsyncImpl(newPromise);
  };

  public readonly bind = <U, F>(
    binder: (value: T) => Result<U, F> | ResultAsync<U, F>
  ): ResultAsync<U, E | F> => {
    const newPromise = this.fold(
      async (err) => {
        return Result.error<U, E>(err);
      },
      async (value) => {
        const newResult = binder(value);
        if (newResult instanceof ResultAsyncImpl) {
          return await newResult._promise;
        }
        return newResult as Result<U, F>;
      }
    );
    return new ResultAsyncImpl(newPromise);
  };

  public readonly exists = (
    predicate: (value: T) => boolean | Promise<boolean>
  ): Promise<boolean> => {
    return this.fold(Fun.never, async (value) => {
      return await predicate(value);
    });
  };

  public readonly forall = (
    predicate: (value: T) => boolean | Promise<boolean>
  ): Promise<boolean> => {
    return this.fold(Fun.always, async (value) => {
      return await predicate(value);
    });
  };

  public readonly getOr = <T2 = T>(replacement: T2): Promise<T | T2> => {
    return this._promise.then((result) => result.getOr(replacement));
  };

  public readonly or = <T2 = T, E2 = E>(
    replacement: Result<T2, E2> | ResultAsync<T2, E2>
  ): ResultAsync<T | T2, E | E2> => {
    const newPromise = this._promise.then(async (result) => {
      if (result.isValue()) {
        return Result.value<T | T2, E | E2>(result.getOrDie());
      }
      if (replacement instanceof ResultAsyncImpl) {
        return await replacement._promise;
      }
      return replacement as Result<T | T2, E | E2>;
    });
    return new ResultAsyncImpl(newPromise);
  };

  public readonly getOrThunk = <T2 = T>(
    thunk: () => T2 | Promise<T2>
  ): Promise<T | T2> => {
    return this.fold<T | T2>(
      async () => {
        return await thunk();
      },
      async (value) => {
        return await value;
      }
    );
  };

  public readonly orThunk = <T2 = T, E2 = E>(
    thunk: () => Result<T2, E2> | ResultAsync<T2, E2> | Promise<Result<T2, E2>>
  ): ResultAsync<T | T2, E | E2> => {
    const newPromise = this._promise.then(async (result) => {
      if (result.isValue()) {
        return Result.value<T | T2, E | E2>(result.getOrDie());
      }
      const thunkResult = await thunk();
      if (thunkResult instanceof ResultAsyncImpl) {
        return await thunkResult._promise;
      }
      return thunkResult as Result<T | T2, E | E2>;
    });
    return new ResultAsyncImpl(newPromise);
  };

  public readonly getOrDie = (): Promise<T> => {
    return this._promise.then((result) => result.getOrDie());
  };

  public readonly each = (
    worker: (value: T) => void | Promise<void>
  ): ResultAsync<T, E> => {
    const newPromise = this.fold(
      async (err) => Result.error(err),
      async (value) => {
        await worker(value);
        return Result.value(value);
      }
    );
    return new ResultAsyncImpl(newPromise);
  };

  public readonly toOptional = (): Promise<Optional<T>> => {
    return this._promise.then((result) => result.toOptional());
  };

  public readonly toPromise = (): Promise<Result<T, E>> => {
    return this._promise;
  };

  public readonly then = <A, B>(
    successCallback?: (res: Result<T, E>) => A | PromiseLike<A>,
    failureCallback?: (reason: unknown) => B | PromiseLike<B>
  ): PromiseLike<A | B> => {
    return this._promise.then(successCallback, failureCallback);
  };
}

/**
 * Creates a `ResultAsync` that will resolve to a success value.
 *
 * @example
 * ```typescript
 * const userResult = ResultAsync.value({ id: 1, name: 'Alice' });
 *
 * // Chain operations
 * const greeting = await userResult
 *   .map(user => `Hello, ${user.name}!`)
 *   .getOr('Hello, unknown user!');
 * // Result: "Hello, Alice!"
 * ```
 */
const value = <T, E = never>(val: T): ResultAsync<T, E> => {
  const promise = Promise.resolve(Result.value<T, E>(val));
  return new ResultAsyncImpl(promise);
};

/**
 * Creates a `ResultAsync` that will resolve to an error value.
 *
 * @example
 * ```typescript
 * const errorResult = ResultAsync.error('User not found');
 *
 * // Handle the error
 * const message = await errorResult
 *   .map(user => `User: ${user.name}`)
 *   .getOr('No user available');
 * // Result: "No user available"
 *
 * // Or use match to handle both cases
 * const status = await errorResult.match(
 *   user => `Found: ${user.name}`,
 *   error => `Error: ${error}`
 * );
 * // Result: "Error: User not found"
 * ```
 */
const error = <T = never, E = any>(err: E): ResultAsync<T, E> => {
  const promise = Promise.resolve(Result.error<T, E>(err));
  return new ResultAsyncImpl(promise);
};

/**
 * Creates a `ResultAsync` from a Promise that is guaranteed not to reject.
 * Use this when you have a Promise that you know will not throw errors.
 *
 * @example
 * ```typescript
 * const fetchConfig = () => Promise.resolve({ apiUrl: 'https://api.example.com' });
 *
 * const configResult = ResultAsync.fromSafePromise(fetchConfig());
 *
 * // Safe to chain operations
 * const apiUrl = await configResult
 *   .map(config => config.apiUrl)
 *   .getOr('https://fallback.example.com');
 * // Result: "https://api.example.com"
 * ```
 */
const fromSafePromise = <T, E = never>(
  promise: PromiseLike<T>
): ResultAsync<T, E> => {
  const newPromise = Promise.resolve(promise).then((val) =>
    Result.value<T, E>(val)
  );
  return new ResultAsyncImpl(newPromise);
};

/**
 * Creates a `ResultAsync` from a Promise that might reject. The second argument
 * is a function that maps any rejection reason to a typed error.
 *
 * @example
 * ```typescript
 * const fetchUser = (id: number) =>
 *   fetch(`/api/users/${id}`).then(res => res.json());
 *
 * const userResult = ResultAsync.fromPromise(
 *   fetchUser(123),
 *   error => ({ type: 'FETCH_ERROR', message: String(error) })
 * );
 *
 * // Handle success and error cases
 * const userName = await userResult
 *   .map(user => user.name)
 *   .getOr('Unknown User');
 *
 * // Or chain with other operations
 * const userProfile = userResult
 *   .bind(user => ResultAsync.fromPromise(
 *     fetchUserProfile(user.id),
 *     err => ({ type: 'PROFILE_ERROR', message: String(err) })
 *   ));
 * ```
 */
const fromPromise = <T, E>(
  promise: PromiseLike<T>,
  errorMapper: (error: unknown) => E
): ResultAsync<T, E> => {
  const newPromise = Promise.resolve(promise)
    .then((val: T) => Result.value<T, E>(val))
    .catch((err: unknown) => Result.error<T, E>(errorMapper(err)));

  return new ResultAsyncImpl(newPromise);
};

/**
 * Creates a `ResultAsync` from a function that returns a Promise. This is
 * safer than `fromPromise` when dealing with functions that might throw
 * synchronously before returning a Promise.
 *
 * @example
 * ```typescript
 * const parseAndFetchUser = async (userJson: string) => {
 *   const userData = JSON.parse(userJson); // Might throw synchronously
 *   return fetch(`/api/users/${userData.id}`).then(res => res.json());
 * };
 *
 * const safeParseAndFetch = ResultAsync.fromThrowable(
 *   parseAndFetchUser,
 *   error => ({ type: 'PARSE_OR_FETCH_ERROR', message: String(error) })
 * );
 *
 * // Safe to use even with invalid JSON
 * const result = safeParseAndFetch('invalid json');
 * const user = await result.getOr({ name: 'Default User' });
 *
 * // Can also be used with valid input
 * const validResult = safeParseAndFetch('{"id": 123}');
 * const validUser = await validResult
 *   .map(user => ({ ...user, lastSeen: new Date() }))
 *   .getOr({ name: 'Default User', lastSeen: new Date() });
 * ```
 */
const fromThrowable = <Args extends readonly unknown[], R, E>(
  fn: (...args: Args) => Promise<R>,
  errorMapper?: (error: unknown) => E
): ((...args: Args) => ResultAsync<R, E>) => {
  return (...args: Args) => {
    const newPromise = (async () => {
      try {
        const result = await fn(...args);
        return Result.value<R, E>(result);
      } catch (err) {
        return Result.error<R, E>(errorMapper ? errorMapper(err) : (err as E));
      }
    })();

    return new ResultAsyncImpl(newPromise);
  };
};

/**
 * Creates a `ResultAsync` from a `Result`. This is useful when you need to
 * convert a synchronous Result into an asynchronous one to maintain
 * consistency in an async pipeline.
 *
 * @example
 * ```typescript
 * const validateAge = (age: number): Result<number, string> => {
 *   return age >= 0 ? Result.value(age) : Result.error('Age must be positive');
 * };
 *
 * const processUser = async (userData: { name: string; age: number }) => {
 *   const ageResult = validateAge(userData.age);
 *   const ageAsync = ResultAsync.fromResult(ageResult);
 *
 *   return ageAsync
 *     .bind(age => ResultAsync.fromPromise(
 *       saveUserToDatabase({ name: userData.name, age }),
 *       err => `Database error: ${err}`
 *     ))
 *     .map(savedUser => ({ ...savedUser, status: 'active' }));
 * };
 *
 * const user = await processUser({ name: 'Bob', age: 25 })
 *   .getOr({ name: 'Unknown', age: 0, status: 'inactive' });
 * ```
 */
const fromResult = <T, E>(result: Result<T, E>): ResultAsync<T, E> => {
  const promise = Promise.resolve(result);
  return new ResultAsyncImpl(promise);
};

/**
 * Creates a `ResultAsync` from an `Optional` and an error value. If the
 * Optional contains a value, the ResultAsync will contain that value.
 * If the Optional is empty, the ResultAsync will contain the error.
 *
 * @example
 * ```typescript
 * const findUserById = (users: User[], id: number): Optional<User> => {
 *   return Optional.from(users.find(user => user.id === id));
 * };
 *
 * const getUserAsync = async (id: number) => {
 *   const users = await fetchAllUsers();
 *   const userOptional = findUserById(users, id);
 *
 *   return ResultAsync.fromOption(userOptional, `User with ID ${id} not found`);
 * };
 *
 * // Usage
 * const user = await getUserAsync(123)
 *   .map(user => ({ ...user, lastAccessed: new Date() }))
 *   .match(
 *     user => `Welcome back, ${user.name}!`,
 *     error => `Access denied: ${error}`
 *   );
 *
 * // Can also chain with other operations
 * const userWithPermissions = getUserAsync(123)
 *   .bind(user => ResultAsync.fromPromise(
 *     fetchUserPermissions(user.id),
 *     err => `Failed to load permissions: ${err}`
 *   ));
 * ```
 */
const fromOption = <T, E>(optional: Optional<T>, err: E): ResultAsync<T, E> => {
  const promise = Promise.resolve(Result.fromOption(optional, err));
  return new ResultAsyncImpl(promise);
};

export const ResultAsync = {
  value,
  error,
  fromPromise,
  fromSafePromise,
  fromThrowable,
  fromResult,
  fromOption,
};
