import { Assertions, Chain, Step } from '@ephox/agar';
import Representing from 'ephox/alloy/api/behaviour/Representing';

const cGetValue = Chain.mapper(function (component) {
  return Representing.getValue(component);
});

const cSetValue = function (value) {
  return Chain.op(function (component) {
    Representing.setValue(component, value);
  });
};

const sSetValue = function (component, value) {
  return Step.sync(function () {
    Representing.setValue(component, value);
  });
};

const sAssertValue = function (label, expected, component) {
  return Chain.asStep(component, [
    cGetValue,
    Assertions.cAssertEq(label, expected)
  ]);
};

export {
  cGetValue,
  cSetValue,
  sAssertValue,
  sSetValue
};