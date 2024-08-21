import { AlloyComponent, Disabling } from '@ephox/alloy';

type DisablingBehaviour = ReturnType<typeof Disabling['config']>;

const item = (config: {
  disabled: () => boolean;
  onEnabled?: (comp: AlloyComponent) => void;
  onDisabled?: (comp: AlloyComponent) => void;
}): DisablingBehaviour => Disabling.config({
  ...config,
  disableClass: 'tox-collection__item--state-disabled'
});

const button = (config: {
  disabled: () => boolean;
  onEnabled?: (comp: AlloyComponent) => void;
  onDisabled?: (comp: AlloyComponent) => void;
}): DisablingBehaviour => Disabling.config({
  ...config
});

const splitButton = (config: {
  disabled: () => boolean;
  onEnabled?: (comp: AlloyComponent) => void;
  onDisabled?: (comp: AlloyComponent) => void;
}): DisablingBehaviour => Disabling.config({
  disableClass: 'tox-tbtn--disabled',
  ...config
});

const toolbarButton = (config: {
  disabled: () => boolean;
  onEnabled?: (comp: AlloyComponent) => void;
  onDisabled?: (comp: AlloyComponent) => void;
}): DisablingBehaviour => Disabling.config({
  disableClass: 'tox-tbtn--disabled',
  useNative: false,
  ...config
});

export const DisablingConfigs = {
  item,
  button,
  splitButton,
  toolbarButton
};
