import { Assertions, Chain, FocusTools, Logger, UiFinder } from '@ephox/agar';
import { AlloyTriggers } from '@ephox/alloy';
import { Traverse, Value } from '@ephox/sugar';

const sAssertValue = (label, expected, component, selector) => Logger.t(
  'DomSteps.sAssertValue(' + expected + '): ' + label,
  Chain.asStep(component.element, [
    UiFinder.cFindIn(selector),
    Chain.op((elem) => {
      Assertions.assertEq('Checking value of ' + selector, expected, Value.get(elem));
    })
  ])
);

const sTriggerEventOnFocused = (label, component, eventName) => Logger.t(
  'DomSteps.sTriggerEventOnFocused(' + eventName + '): ' + label,
  Chain.asStep(Traverse.owner(component.element), [
    FocusTools.cGetFocused,
    Chain.binder((focused) => component.getSystem().getByDom(focused)),
    Chain.op((input) => AlloyTriggers.emit(input, eventName))
  ])
);

export const DomSteps = {
  sAssertValue,
  sTriggerEventOnFocused
};
