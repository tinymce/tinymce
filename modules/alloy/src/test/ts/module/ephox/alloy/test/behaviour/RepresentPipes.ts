import { Assertions, Chain, Step } from '@ephox/agar';

import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const cGetValue = Chain.mapper((component: AlloyComponent) => {
  return Representing.getValue(component);
});

const cSetValue = (value: string) => {
  return Chain.op((component: AlloyComponent) => {
    Representing.setValue(component, value);
  });
};

const sSetValue = (component: AlloyComponent, value: string) => {
  return Step.sync(() => {
    Representing.setValue(component, value);
  });
};

const sAssertValue = (label: string, expected: string, component: AlloyComponent) => {
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
