/* eslint-disable @tinymce/no-unimported-promise */
import { Assert } from '@ephox/bedrock-client';
import { Testable } from '@ephox/dispute';

type Testable<A> = Testable.Testable<A>;

// TODO: move to bedrock
export const eqAsync = <A>(label: string, expected: A, actual: A, reject: (a: any) => void, testableA: Testable<A> = Testable.tAny): void => {
  try {
    Assert.eq(label, expected, actual, testableA);
  } catch (e) {
    reject(e);
  }
};
