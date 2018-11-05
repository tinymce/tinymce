import { Assertions, Chain, Step } from '@ephox/agar';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const cGetValue = Chain.mapper((component: AlloyComponent) => {
  return Representing.getValue(component);
});

const cSetValue = (value) => {
  return Chain.op((component: AlloyComponent) => {
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