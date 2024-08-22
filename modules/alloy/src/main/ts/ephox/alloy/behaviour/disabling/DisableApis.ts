import { Arr } from '@ephox/katamari';
import { Attribute, Class, SugarNode } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { DisableConfig, DisableState } from './DisableTypes';

// Just use "disabled" attribute for these, not "aria-disabled"
const nativeDisabled = [
  'input',
  'button',
  'textarea',
  'select'
];

const onLoad = (component: AlloyComponent, disableConfig: DisableConfig, disableState: DisableState): void => {
  const f = disableConfig.disabled() ? disable : enable;
  f(component, disableConfig, disableState, false);
};

const hasNative = (component: AlloyComponent, config: DisableConfig): boolean =>
  config.useNative === true && Arr.contains(nativeDisabled, SugarNode.name(component.element));

const nativeIsDisabled = (component: AlloyComponent): boolean => Attribute.has(component.element, 'disabled');

const nativeDisable = (component: AlloyComponent): void => {
  Attribute.set(component.element, 'disabled', 'disabled');
};

const nativeEnable = (component: AlloyComponent): void => {
  Attribute.remove(component.element, 'disabled');
};

const ariaIsDisabled = (component: AlloyComponent): boolean =>
  Attribute.get(component.element, 'aria-disabled') === 'true';

const ariaDisable = (component: AlloyComponent): void => {
  Attribute.set(component.element, 'aria-disabled', 'true');
};

const ariaEnable = (component: AlloyComponent): void => {
  Attribute.set(component.element, 'aria-disabled', 'false');
};

const disable = (component: AlloyComponent, disableConfig: DisableConfig, disableState: DisableState, storeState: boolean = false): void => {
  disableConfig.disableClass.each((disableClass) => {
    Class.add(component.element, disableClass);
  });
  const f = hasNative(component, disableConfig) ? nativeDisable : ariaDisable;
  f(component);
  if (storeState) {
    disableState.setLastDisabledState(true);
  }
  disableConfig.onDisabled(component);
};

const enable = (component: AlloyComponent, disableConfig: DisableConfig, disableState: DisableState, storeState: boolean = false): void => {
  disableConfig.disableClass.each((disableClass) => {
    Class.remove(component.element, disableClass);
  });
  const f = hasNative(component, disableConfig) ? nativeEnable : ariaEnable;
  f(component);
  if (storeState) {
    disableState.setLastDisabledState(false);
  }
  disableConfig.onEnabled(component);
};

const isDisabled = (component: AlloyComponent, disableConfig: DisableConfig): boolean =>
  hasNative(component, disableConfig) ? nativeIsDisabled(component) : ariaIsDisabled(component);

const set = (component: AlloyComponent, disableConfig: DisableConfig, disableState: DisableState, disabled: boolean): void => {
  const f = disabled ? disable : enable;
  f(component, disableConfig, disableState);
};

const setAndStoreState = (component: AlloyComponent, disableConfig: DisableConfig, disableState: DisableState, disabled: boolean): void => {
  const f = disabled ? disable : enable;
  f(component, disableConfig, disableState, true);
};

const getLastDisabledState = (_: AlloyComponent, __: DisableConfig, disableState: DisableState): boolean | undefined =>
  disableState.getLastDisabledState();

export {
  enable,
  disable,
  isDisabled,
  onLoad,
  set,
  setAndStoreState,
  getLastDisabledState
};
