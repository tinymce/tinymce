import { RawAssertions, Step } from '@ephox/agar';
import { Option } from '@ephox/katamari';

export default function () {
  let array = [ ];
  const adder = function (value) {
    return function () {
      array.push(value);
      // tslint:disable-next-line:no-console
      console.log('store.add', value, array);
    };
  };

  // Used for keyboard handlers which need to return Option to know whether or not to kill the event
  const adderH = function (value) {
    return function () {
      adder(value)();
      return Option.some(true);
    };
  };

  const sClear = Step.sync(function () {
    array = [ ];
  });

  const clear = function () {
    array = [ ];
  };

  const sAssertEq = function (label, expected) {
    return Step.sync(function () {
      // Can't use a normal step here, because we don't need to get array lazily
      return RawAssertions.assertEq(label, expected, array.slice(0));
    });
  };

  const assertEq = function (label, expected) {
    return RawAssertions.assertEq(label, expected, array.slice(0));
  };

  const sAssertSortedEq = function (label, expected) {
    return Step.sync(function () {
      // Can't use a normal step here, because we don't need to get array lazily
      return RawAssertions.assertEq(label, expected.slice(0).sort(), array.slice(0).sort());
    });
  };

  return {
    adder,
    adderH,
    clear,
    sClear,
    sAssertEq,
    assertEq,
    sAssertSortedEq
  };
}