import { Chain, Step } from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { console } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

export interface TestStore {
  add: (value: any) => void;
  adder: (value: any) => () => void;
  adderH: (value: any) => () => Option<boolean>;
  clear: () => void;
  sClear: Step<any, any>;
  cClear: Chain<any, any>;
  sAssertEq: <T> (label: string, expected: any[]) => Step<T, T>;
  cAssertEq: <T> (label: string, expected: any[]) => Chain<T, T>;
  assertEq: (label: string, expected: any[]) => void;
  sAssertSortedEq: (label: string, expected: any[]) => Step<any, any>;
}

export const TestStore = (): TestStore => {
  let array: any[] = [ ];

  const add = (value: any) => {
    array.push(value);
    // tslint:disable-next-line:no-console
    console.log('store.add', value, array);
  };

  const adder = (value: any) => () => add(value);

  // Used for keyboard handlers which need to return Option to know whether or not to kill the event
  const adderH = (value: any) => () => {
    add(value);
    return Option.some(true);
  };

  const sClear = Step.sync(() => {
    array = [ ];
  });

  const clear = () => {
    array = [ ];
  };

  const cClear = Chain.op(() => {
    clear();
  });

  const sAssertEq = <T> (label: string, expected: any[]): Step<T, T> => Step.sync(() =>
  // Can't use a normal step here, because we don't need to get array lazily
    Assert.eq(label, expected, array.slice(0))
  );

  const cAssertEq = <T> (label: string, expected: any[]): Chain<T, T> => Chain.op(() => {
    assertEq(label, expected);
  });

  const assertEq = (label: string, expected: any[]) => Assert.eq(label, expected, array.slice(0));

  const sAssertSortedEq = (label: string, expected: any[]) => Step.sync(() =>
  // Can't use a normal step here, because we don't need to get array lazily
    Assert.eq(label, expected.slice(0).sort(), array.slice(0).sort())
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
    sAssertSortedEq
  };
};
