import { Assertions, Chain, Step } from '@ephox/agar';

import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const cGetValue = Chain.mapper((component: AlloyComponent) => Representing.getValue(component));

const cSetValue = (value: string) => Chain.op((component: AlloyComponent) => {
  Representing.setValue(component, value);
});

const sSetValue = (component: AlloyComponent, value: string) => Step.sync(() => {
  Representing.setValue(component, value);
});

const sAssertValue = (label: string, expected: string, component: AlloyComponent) => Chain.asStep(component, [
  cGetValue,
  Assertions.cAssertEq(label, expected)
]);

export {
  cGetValue,
  cSetValue,
  sAssertValue,
  sSetValue
};
