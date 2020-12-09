import { Assertions, Chain, Step } from '@ephox/agar';

import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const cGetValue = Chain.mapper((component: AlloyComponent) => Representing.getValue(component));

const cSetValue = (value: string): Chain<AlloyComponent, AlloyComponent> =>
  Chain.op((component: AlloyComponent) => {
    Representing.setValue(component, value);
  });

const sSetValue = <T>(component: AlloyComponent, value: string): Step<T, T> =>
  Step.sync(() => {
    Representing.setValue(component, value);
  });

const sAssertValue = <T>(label: string, expected: string, component: AlloyComponent): Step<T, T> =>
  Chain.asStep(component, [
    cGetValue,
    Assertions.cAssertEq(label, expected)
  ]);

export {
  cGetValue,
  cSetValue,
  sAssertValue,
  sSetValue
};
