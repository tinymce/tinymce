import { Disabling } from '@ephox/alloy';

type DisablingBehaviour = ReturnType<typeof Disabling['config']>;

const item = (disabled: () => boolean): DisablingBehaviour => Disabling.config({
  disabled,
  disableClass: 'tox-collection__item--state-disabled'
});

const button = (disabled: () => boolean): DisablingBehaviour => Disabling.config({
  disabled
});

const splitButton = (disabled: () => boolean): DisablingBehaviour => Disabling.config({
  disabled,
  disableClass: 'tox-tbtn--disabled'
});

const toolbarButton = (disabled: () => boolean): DisablingBehaviour => Disabling.config({
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
