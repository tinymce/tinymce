import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Representing from 'ephox/alloy/api/behaviour/Representing';

var cGetValue = Chain.mapper(function (component) {
  return Representing.getValue(component);
});

var cSetValue = function (value) {
  return Chain.op(function (component) {
    Representing.setValue(component, value);
  });
};

var sSetValue = function (component, value) {
  return Step.sync(function () {
    Representing.setValue(component, value);
  });
};

var sAssertValue = function (label, expected, component) {
  return Chain.asStep(component, [
    cGetValue,
    Assertions.cAssertEq(label, expected)
  ]);
};

export default <any> {
  cGetValue: cGetValue,
  cSetValue: cSetValue,
  sAssertValue: sAssertValue,
  sSetValue: sSetValue
};