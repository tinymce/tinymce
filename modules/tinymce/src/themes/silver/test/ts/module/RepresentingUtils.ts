import { AlloyComponent, Composing, Representing } from '@ephox/alloy';
import { assert } from 'chai';

const assertComposedValue = (component: AlloyComponent, expected: any) => {
  const c = Composing.getCurrent(component).getOrDie('Trying to get the composed component');
  assert.deepEqual(Representing.getValue(c), expected, 'Representing value');
};

const assertValue = (component: AlloyComponent, expected: any) => {
  assert.deepEqual(Representing.getValue(component), expected, 'Representing value');
};

const setComposedValue = (component: AlloyComponent, newValue: any) => {
  const c = Composing.getCurrent(component).getOrDie('Trying to get the composed component');
  Representing.setValue(c, newValue);
};

const assertRoundtrip = (component: AlloyComponent, newValue: any) => {
  Representing.setValue(component, newValue);
  assertValue(component, newValue);
};

export {
  assertComposedValue,
  assertValue,
  setComposedValue,
  assertRoundtrip
};
