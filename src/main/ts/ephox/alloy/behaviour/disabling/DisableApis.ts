import { Arr } from '@ephox/katamari';
import { Attr, Class, Node } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from '../../behaviour/common/NoState';
import { DisableConfig } from '../../behaviour/disabling/DisableTypes';

// Just use "disabled" attribute for these, not "aria-disabled"
const nativeDisabled = [
  'input',
  'button',
  'textarea'
];

const onLoad = function (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless): void {
  if (disableConfig.disabled()) { disable(component, disableConfig, disableState); }
};

const hasNative = function (component: AlloyComponent): boolean {
  return Arr.contains(nativeDisabled, Node.name(component.element()));
};

const nativeIsDisabled = function (component: AlloyComponent): boolean {
  return Attr.has(component.element(), 'disabled');
};

const nativeDisable = function (component: AlloyComponent): void {
  Attr.set(component.element(), 'disabled', 'disabled');
};

const nativeEnable = function (component: AlloyComponent): void {
  Attr.remove(component.element(), 'disabled');
};

const ariaIsDisabled = function (component: AlloyComponent): boolean {
  return Attr.get(component.element(), 'aria-disabled') === 'true';
};

const ariaDisable = function (component: AlloyComponent): void {
  Attr.set(component.element(), 'aria-disabled', 'true');
};

const ariaEnable = function (component: AlloyComponent): void {
  Attr.set(component.element(), 'aria-disabled', 'false');
};

const disable = function (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless): void {
  disableConfig.disableClass().each(function (disableClass) {
    Class.add(component.element(), disableClass);
  });
  const f = hasNative(component) ? nativeDisable : ariaDisable;
  f(component);
};

const enable = function (component: AlloyComponent, disableConfig: DisableConfig, disableState: Stateless): void {
  disableConfig.disableClass().each(function (disableClass) {
    Class.remove(component.element(), disableClass);
  });
  const f = hasNative(component) ? nativeEnable : ariaEnable;
  f(component);
};

const isDisabled = function (component: AlloyComponent): boolean {
  return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
};

export {
  enable,
  disable,
  isDisabled,
  onLoad
};