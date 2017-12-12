import { Arr } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Class } from '@ephox/sugar';
import { Node } from '@ephox/sugar';

// Just use "disabled" attribute for these, not "aria-disabled"
var nativeDisabled = [
  'input',
  'button',
  'textarea'
];

var onLoad = function (component, disableConfig, disableState) {
  if (disableConfig.disabled()) disable(component, disableConfig, disableState);
};

var hasNative = function (component) {
  return Arr.contains(nativeDisabled, Node.name(component.element()));
};

var nativeIsDisabled = function (component) {
  return Attr.has(component.element(), 'disabled');
};

var nativeDisable = function (component) {
  Attr.set(component.element(), 'disabled', 'disabled');
};

var nativeEnable = function (component) {
  Attr.remove(component.element(), 'disabled');
};

var ariaIsDisabled = function (component) {
  return Attr.get(component.element(), 'aria-disabled') === 'true';
};

var ariaDisable = function (component) {
  Attr.set(component.element(), 'aria-disabled', 'true');
};

var ariaEnable = function (component) {
  Attr.set(component.element(), 'aria-disabled', 'false');
};

var disable = function (component, disableConfig, disableState) {
  disableConfig.disableClass().each(function (disableClass) {
    Class.add(component.element(), disableClass);
  });
  var f = hasNative(component) ? nativeDisable : ariaDisable;
  f(component);
};

var enable = function (component, disableConfig, disableState) {
  disableConfig.disableClass().each(function (disableClass) {
    Class.remove(component.element(), disableClass);
  });
  var f = hasNative(component) ? nativeEnable : ariaEnable;
  f(component);
};

var isDisabled = function (component) {
  return hasNative(component) ? nativeIsDisabled(component) : ariaIsDisabled(component);
};

export default <any> {
  enable: enable,
  disable: disable,
  isDisabled: isDisabled,
  onLoad: onLoad
};