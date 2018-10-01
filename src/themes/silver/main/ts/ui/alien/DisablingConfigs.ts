import { Disabling } from '@ephox/alloy';

const item = (disabled: boolean) => Disabling.config({
  disabled,
  disableClass: 'tox-collection__item--state-disabled'
});

const button = (disabled: boolean) => Disabling.config({
  disabled
});

export const DisablingConfigs = {
  item,
  button
};