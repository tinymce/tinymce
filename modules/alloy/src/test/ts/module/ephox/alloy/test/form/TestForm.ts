import { Assertions, Step } from '@ephox/agar';
import { Obj, Optional } from '@ephox/katamari';

import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

interface TestForm {
  readonly sAssertRep: <T>(expected: Record<string, string>) => Step<T, T>;
  readonly sSetRep: <T>(newValues: Record<string, string>) => Step<T, T>;
}

const helper = (component: AlloyComponent): TestForm => {
  const sAssertRep = <T>(expected: Record<string, string>) => Step.sync<T>(() => {
    const val: Record<string, Optional<string>> = Representing.getValue(component);
    Assertions.assertEq(
      'Checking form value',
      expected,

      Obj.map(val, (v, k) => v.getOrDie(k + ' field is "None"'))
    );
  });

  const sSetRep = <T>(newValues: Record<string, string>) => Step.sync<T>(() => {
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
