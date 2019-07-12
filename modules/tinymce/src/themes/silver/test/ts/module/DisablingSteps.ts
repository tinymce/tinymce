import { Step, Assertions, Logger, Chain } from '@ephox/agar';
import { AlloyComponent, Disabling } from '@ephox/alloy';

const sAssertDisabled = (label: string, expected: boolean, component: AlloyComponent) => Logger.t(
  'sAssertDisabled: ' + label,
  Chain.asStep(component, [
    Chain.mapper(Disabling.isDisabled),
    Assertions.cAssertEq(label, expected)
  ])
);

const sSetDisabled = (label: string, component: AlloyComponent, newValue: boolean) => Logger.t(
  'sSetDisabled: ' + label,
  Step.sync(() => {
    Disabling.set(component, newValue);
  })
);

export const DisablingSteps = {
  sAssertDisabled,
  sSetDisabled
};
