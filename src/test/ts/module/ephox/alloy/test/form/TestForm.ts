import { Assertions, Step } from '@ephox/agar';
import { Obj } from '@ephox/katamari';
import Representing from 'ephox/alloy/api/behaviour/Representing';

const helper = function (component) {
  const sAssertRep = function (expected) {
    return Step.sync(function () {
      const val = Representing.getValue(component);
      Assertions.assertEq(
        'Checking form value',
        expected,

        Obj.map(val, function (v, k) {
          return v.getOrDie(k + ' field is "None"');
        })
      );
    });
  };

  const sSetRep = function (newValues) {
    return Step.sync(function () {
      Representing.setValue(component, newValues);
    });
  };

  return {
    sAssertRep,
    sSetRep
  };
};

export default <any> {
  helper
};