import { Assertions, Step } from '@ephox/agar';
import { Obj } from '@ephox/katamari';

import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

const helper = (component: AlloyComponent) => {
  const sAssertRep = (expected: Record<string, string>) => Step.sync(() => {
    const val = Representing.getValue(component);
    Assertions.assertEq(
      'Checking form value',
      expected,

      Obj.map(val, (v, k) => v.getOrDie(k + ' field is "None"'))
    );
  });

  const sSetRep = (newValues: Record<string, string>) => Step.sync(() => {
    Representing.setValue(component, newValues);
  });

  return {
    sAssertRep,
    sSetRep
  };
};

export {
  helper
};
