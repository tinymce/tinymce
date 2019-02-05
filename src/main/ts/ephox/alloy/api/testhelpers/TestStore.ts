import { RawAssertions, Step, Chain } from '@ephox/agar';
import { Option } from '@ephox/katamari';
import { console } from '@ephox/dom-globals';

export default () => {
  let array = [ ];
  const adder = (value) => {
    return () => {
      array.push(value);
      // tslint:disable-next-line:no-console
      console.log('store.add', value, array);
    };
  };

  // Used for keyboard handlers which need to return Option to know whether or not to kill the event
  const adderH = (value) => {
    return () => {
      adder(value)();
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

  const sAssertEq = (label, expected) => {
    return Step.sync(() => {
      // Can't use a normal step here, because we don't need to get array lazily
      return RawAssertions.assertEq(label, expected, array.slice(0));
    });
  };

  const cAssertEq = (label, expected) => {
    return Chain.op(() => {
      assertEq(label, expected);
    });
  };

  const assertEq = (label, expected) => {
    return RawAssertions.assertEq(label, expected, array.slice(0));
  };

  const sAssertSortedEq = (label, expected) => {
    return Step.sync(() => {
      // Can't use a normal step here, because we don't need to get array lazily
      return RawAssertions.assertEq(label, expected.slice(0).sort(), array.slice(0).sort());
    });
  };

  return {
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