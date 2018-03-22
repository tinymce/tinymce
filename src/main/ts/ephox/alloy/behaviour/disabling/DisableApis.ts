import { Arr } from '@ephox/katamari';
import { Attr, Class, Node } from '@ephox/sugar';

// Just use "disabled" attribute for these, not "aria-disabled"
const nativeDisabled = [
  'input',
  'button',
  'textarea'
];

const onLoad = function (component, disableConfig, disableState) {
  if (disableConfig.disabled()) { disable(component, disableConfig, disableState); }
};

const hasNative = function (component) {
  return Arr.contains(nativeDisabled, Node.name(component.element()));
};

const nativeIsDisabled = function (component) {
  return Attr.has(component.element(), 'disabled');
};

const nativeDisable = function (component) {
  Attr.set(component.element(), 'disabled', 'disabled');
};

const nativeEnable = function (component) {
  Attr.remove(component.element(), 'disabled');
};

const ariaIsDisabled = function (component) {
  return Attr.get(component.element(), 'aria-disabled') === 'true';
};

const ariaDisable = function (component) {
  Attr.set(component.element(), 'aria-disabled', 'true');
};

const ariaEnable = function (component) {
  Attr.set(component.element(), 'aria-disabled', 'false');
};

const disable = function (component, disableConfig, disableState) {
  disableConfig.disableClass().each(function (disableClass) {
    Class.add(component.element(), disableClass);
  });
  const f = hasNative(component) ? nativeDisable : ariaDisable;
  f(component);
};

const enable = function (component, disableConfig, disableState) {
  disableConfig.disableClass().each(function (disableClass) {
    Class.remove(component.element(), disableClass);
  });
  const f = hasNative(component) ? nativeEnable : ariaEnable;
  f(component);
};

const isDisabled = function (component) {
  return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
};

export {
  enable,
  disable,
  isDisabled,
  onLoad
};