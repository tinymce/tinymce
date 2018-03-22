import { Class } from '@ephox/sugar';

const swap = function (element, addCls, removeCls) {
  Class.remove(element, removeCls);
  Class.add(element, addCls);
};

const toAlpha = function (component, swapConfig, swapState) {
  swap(component.element(), swapConfig.alpha(), swapConfig.omega());
};

const toOmega = function (component, swapConfig, swapState) {
  swap(component.element(), swapConfig.omega(), swapConfig.alpha());
};

const clear = function (component, swapConfig, swapState) {
  Class.remove(component.element(), swapConfig.alpha());
  Class.remove(component.element(), swapConfig.omega());
};

const isAlpha = function (component, swapConfig, swapState) {
  return Class.has(component.element(), swapConfig.alpha());
};

const isOmega = function (component, swapConfig, swapState) {
  return Class.has(component.element(), swapConfig.omega());
};

export {
  toAlpha,
  toOmega,
  isAlpha,
  isOmega,
  clear
};