import { RawAssertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Option } from '@ephox/katamari';



export default <any> function () {
  var array = [ ];
  var adder = function (value) {
    return function () {
      array.push(value);
      console.log('store.add', value, array);
    };
  };

  // Used for keyboard handlers which need to return Option to know whether or not to kill the event
  var adderH = function (value) {
    return function () {
      adder(value)();
      return Option.some(true);
    };
  };

  var sClear = Step.sync(function () {
    array = [ ];
  });

  var clear = function () {
    array = [ ];
  };

  var sAssertEq = function (label, expected) {
    return Step.sync(function () {
      // Can't use a normal step here, because we don't need to get array lazily
      return RawAssertions.assertEq(label, expected, array.slice(0));
    });
  };

  var assertEq = function (label, expected) {
    return RawAssertions.assertEq(label, expected, array.slice(0));
  };

  var sAssertSortedEq = function (label, expected) {
    return Step.sync(function () {
      // Can't use a normal step here, because we don't need to get array lazily
      return RawAssertions.assertEq(label, expected.slice(0).sort(), array.slice(0).sort());
    });
  };

  return {
    adder: adder,
    adderH: adderH,
    clear: clear,
    sClear: sClear,
    sAssertEq: sAssertEq,
    assertEq: assertEq,
    sAssertSortedEq: sAssertSortedEq
  };
};