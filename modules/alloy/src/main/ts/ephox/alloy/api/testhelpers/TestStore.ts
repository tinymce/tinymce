import { Chain, Step } from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { console } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

interface TestStore {
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

const TestStore = (): TestStore => {
  let array: any[] = [ ];

  const add = (value: any) => {
    array.push(value);
    // tslint:disable-next-line:no-console
    console.log('store.add', value, array);
  };

  const adder = (value: any) => {
    return () => add(value);
  };

  // Used for keyboard handlers which need to return Option to know whether or not to kill the event
  const adderH = (value: any) => {
    return () => {
      add(value);
      return Option.some(true);
    };
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

  const sAssertEq = <T> (label: string, expected: any[]): Step<T, T> => {
    return Step.sync(() => {
      // Can't use a normal step here, because we don't need to get array lazily
      return Assert.eq(label, expected, array.slice(0));
    });
  };

  const cAssertEq = <T> (label: string, expected: any[]): Chain<T, T> => {
    return Chain.op(() => {
      assertEq(label, expected);
    });
  };

  const assertEq = (label: string, expected: any[]) => {
    return Assert.eq(label, expected, array.slice(0));
  };

  const sAssertSortedEq = (label: string, expected: any[]) => {
    return Step.sync(() => {
      // Can't use a normal step here, because we don't need to get array lazily
      return Assert.eq(label, expected.slice(0).sort(), array.slice(0).sort());
    });
  };

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

export default TestStore;
