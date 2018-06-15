import { Assertions, Chain, Step } from '@ephox/agar';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';

const cGetValue = Chain.mapper((component) => {
  return Representing.getValue(component);
});

const cSetValue = (value) => {
  return Chain.op((component) => {
    Representing.setValue(component, value);
  });
};

const sSetValue = (component, value) => {
  return Step.sync(() => {
    Representing.setValue(component, value);
  });
};

const sAssertValue = (label, expected, component) => {
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