import { Assertions } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Representing from 'ephox/alloy/api/behaviour/Representing';
import { Obj } from '@ephox/katamari';

var helper = function (component) {
  var sAssertRep = function (expected) {
    return Step.sync(function () {
      var val = Representing.getValue(component);
      Assertions.assertEq(
        'Checking form value',
        expected,

        Obj.map(val, function (v, k) {
          return v.getOrDie(k + ' field is "None"');
        })
      );
    });
  };

  var sSetRep = function (newValues) {
    return Step.sync(function () {
      Representing.setValue(component, newValues);
    });
  };

  return {
    sAssertRep: sAssertRep,
    sSetRep: sSetRep
  };
};

export default <any> {
  helper: helper
};