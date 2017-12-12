import { Class } from '@ephox/sugar';

var swap = function (element, addCls, removeCls) {
  Class.remove(element, removeCls);
  Class.add(element, addCls);
};

var toAlpha = function (component, swapConfig, swapState) {
  swap(component.element(), swapConfig.alpha(), swapConfig.omega());
};

var toOmega = function (component, swapConfig, swapState) {
  swap(component.element(), swapConfig.omega(), swapConfig.alpha());
};

var clear = function (component, swapConfig, swapState) {
  Class.remove(component.element(), swapConfig.alpha());
  Class.remove(component.element(), swapConfig.omega());
};

var isAlpha = function (component, swapConfig, swapState) {
  return Class.has(component.element(), swapConfig.alpha());
};

var isOmega = function (component, swapConfig, swapState) {
  return Class.has(component.element(), swapConfig.omega());
};

export default <any> {
  toAlpha: toAlpha,
  toOmega: toOmega,
  isAlpha: isAlpha,
  isOmega: isOmega,
  clear: clear
};