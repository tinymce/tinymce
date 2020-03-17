import { Arr } from '@ephox/katamari';
import { Attr, Class, Node } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from '../../behaviour/common/BehaviourState';
import { DisableConfig } from './DisableTypes';

// Just use "disabled" attribute for these, not "aria-disabled"
const nativeDisabled = [
  'input',
  'button',
  'textarea',
  'select'
];

const onLoad = (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless): void => {
  if (disableConfig.disabled) {
    disable(component, disableConfig, disableState);
  }
};

const hasNative = (component: AlloyComponent, config: DisableConfig): boolean => config.useNative === true && Arr.contains(nativeDisabled, Node.name(component.element()));

const nativeIsDisabled = (component: AlloyComponent): boolean => Attr.has(component.element(), 'disabled');

const nativeDisable = (component: AlloyComponent): void => {
  Attr.set(component.element(), 'disabled', 'disabled');
};

const nativeEnable = (component: AlloyComponent): void => {
  Attr.remove(component.element(), 'disabled');
};

const ariaIsDisabled = (component: AlloyComponent): boolean => Attr.get(component.element(), 'aria-disabled') === 'true';

const ariaDisable = (component: AlloyComponent): void => {
  Attr.set(component.element(), 'aria-disabled', 'true');
};

const ariaEnable = (component: AlloyComponent): void => {
  Attr.set(component.element(), 'aria-disabled', 'false');
};

const disable = (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless): void => {
  disableConfig.disableClass.each((disableClass) => {
    Class.add(component.element(), disableClass);
  });
  const f = hasNative(component, disableConfig) ? nativeDisable : ariaDisable;
  f(component);
  disableConfig.onDisabled(component);
};

const enable = (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless): void => {
  disableConfig.disableClass.each((disableClass) => {
    Class.remove(component.element(), disableClass);
  });
  const f = hasNative(component, disableConfig) ? nativeEnable : ariaEnable;
  f(component);
  disableConfig.onEnabled(component);
};

const isDisabled = (component: AlloyComponent, disableConfig: DisableConfig): boolean => hasNative(component, disableConfig) ? nativeIsDisabled(component) : ariaIsDisabled(component);

const set = (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless, disabled: boolean) => {
  const f = disabled ? disable : enable;
  f(component, disableConfig, disableState);
};

export {
  enable,
  disable,
  isDisabled,
  onLoad,
  set
};
