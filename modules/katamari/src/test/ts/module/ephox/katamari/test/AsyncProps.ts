/* tslint:disable:no-unimported-promise */
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';

type Testable<A> = Testable.Testable<A>;

// TODO: move to bedrock
/**
 * Execute a test defined as a Promise.
 *
 * Useful for fast-check asyncProperty tests. e.g.:
 *
 * ```
 * promiseTest('', () => {
 *   return fc.assert(fc.asyncProperty(fc.integer(), (i) => {
 *     return new Promise((resolve, reject) => {
 *
 *     });
 *   }));
 * });
 * ```
 * @param name
 * @param f
 */
export const promiseTest = <A>(name: string, f: () => Promise<A>): void => {
  UnitTest.asynctest(name, (success, failure) => {
    f().then(function () {
      success();
    }, failure);
  });
};

// TODO: move to bedrock
export const eqAsync = <A>(label: string, expected: A, actual: A, reject: (a: any) => void, testableA: Testable<A> = Testable.tAny) => {
  try {
    Assert.eq(label, expected, actual, testableA);
  } catch (e) {
    reject(e);
  }
};
