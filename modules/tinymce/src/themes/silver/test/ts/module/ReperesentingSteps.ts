import { Step, Assertions, Logger, Chain, GeneralSteps } from '@ephox/agar';
import { Composing, Representing } from '@ephox/alloy';

const sAssertComposedValue = (label, expected, component) => Logger.t(
  'sAssertComposedValue: ' + label,
  Step.sync(() => {
    const c = Composing.getCurrent(component).getOrDie('Trying to get the composed component');
    Assertions.assertEq('Representing value', expected, Representing.getValue(c));
  })
);

const sAssertValue = (label, expected, component) => Logger.t(
  'sAssertValue: ' + label,
  Chain.asStep(component, [
    Chain.mapper(Representing.getValue),
    Assertions.cAssertEq(label, expected)
  ])
);

const sSetValue = (label, component, newValue) => Logger.t(
  'sSetValue: ' + label,
  Step.sync(() => {
    Representing.setValue(component, newValue);
  })
);

const sSetComposedValue = (label, component, newValue) => Logger.t(
  'sAssertComposedValue: ' + label,
  Step.sync(() => {
    const c = Composing.getCurrent(component).getOrDie('Trying to get the composed component');
    Representing.setValue(c, newValue);
  })
);

const sAssertRoundtrip = (label, component, newValue) => GeneralSteps.sequence([
  sSetValue(label, component, newValue),
  sAssertValue(label, newValue, component)
]);

export const RepresentingSteps = {
  sAssertComposedValue,
  sAssertValue,
  sSetComposedValue,
  sAssertRoundtrip,
  sSetValue
};