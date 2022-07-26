import { FocusTools, UiFinder } from '@ephox/agar';
import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Traverse, Value } from '@ephox/sugar';
import { assert } from 'chai';

const assertValue = (label: string, component: AlloyComponent, selector: string, expected: string): void => {
  const elem = UiFinder.findIn<HTMLSelectElement>(component.element, selector).getOrDie();
  assert.equal(Value.get(elem), expected, label + ' - checking value of ' + selector);
};

const triggerEventOnFocused = (component: AlloyComponent, eventName: string): void => {
  const doc = Traverse.owner(component.element);
  const focused = FocusTools.getFocused(doc).getOrDie();
  const input = component.getSystem().getByDom(focused).getOrDie();
  AlloyTriggers.emit(input, eventName);
};

export {
  assertValue,
  triggerEventOnFocused
};
