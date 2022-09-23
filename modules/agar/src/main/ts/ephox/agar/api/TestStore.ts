import { Assert } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';

import { Chain } from './Chain';
import { Step } from './Step';

export interface TestStore<T = string> {
  add: (value: T) => void;
  adder: (value: T) => () => void;
  adderH: (value: T) => () => Optional<boolean>;
  clear: () => void;
  sClear: Step<any, any>;
  cClear: Chain<any, any>;
  sAssertEq: (label: string, expected: T[]) => Step<any, any>;
  cAssertEq: (label: string, expected: T[]) => Chain<any, any>;
  assertEq: (label: string, expected: T[]) => void;
  assertSortedEq: (label: string, expected: T[], cmp?: (a: T, b: T) => number) => void;
  sAssertSortedEq: (label: string, expected: T[], cmp?: (a: T, b: T) => number) => Step<any, any>;
}

export const TestStore = <T = string>(): TestStore<T> => {
  let array: T[] = [];

  const add = (value: T) => {
    array.push(value);
  };

  const adder = (value: T) => () => add(value);

  // Used for keyboard handlers which need to return Optional to know whether or not to kill the event
  const adderH = (value: T) => () => {
    add(value);
    return Optional.some(true);
  };

  const sClear = Step.sync(() => {
    array = [];
  });

  const clear = () => {
    array = [];
  };

  const cClear = Chain.op(() => {
    clear();
  });

  const sAssertEq = (label: string, expected: T[]): Step<any, any> => Step.sync(() =>
    Assert.eq(label, expected, array.slice(0))
  );

  const cAssertEq = (label: string, expected: T[]): Chain<any, any> => Chain.op(() => {
    assertEq(label, expected);
  });

  const assertEq = (label: string, expected: T[]) => Assert.eq(label, expected, array.slice(0));

  const assertSortedEq = (label: string, expected: T[], cmp?: (a: T, b: T) => number) =>
    Assert.eq(label, expected.slice(0).sort(cmp), array.slice(0).sort(cmp));

  const sAssertSortedEq = (label: string, expected: T[], cmp?: (a: T, b: T) => number) => Step.sync(() =>
    assertSortedEq(label, expected, cmp)
  );

  return {
    add,
    adder,
    adderH,
    clear,
    sClear,
    cClear,
    sAssertEq,
    cAssertEq,
    assertEq,
    assertSortedEq,
    sAssertSortedEq
  };
};
