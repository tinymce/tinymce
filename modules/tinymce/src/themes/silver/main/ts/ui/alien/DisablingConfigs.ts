import { Disabling } from '@ephox/alloy';

const item = (disabled: () => boolean) => Disabling.config({
  disabled,
  disableClass: 'tox-collection__item--state-disabled'
});

const button = (disabled: () => boolean) => Disabling.config({
  disabled
});

const splitButton = (disabled: () => boolean) => Disabling.config({
  disabled,
  disableClass: 'tox-tbtn--disabled'
});

const toolbarButton = (disabled: () => boolean) => Disabling.config({
  disabled,
  disableClass: 'tox-tbtn--disabled',
  useNative: false
});

export const DisablingConfigs = {
  item,
  button,
  splitButton,
  toolbarButton
};
