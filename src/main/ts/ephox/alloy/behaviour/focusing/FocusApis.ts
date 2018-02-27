import { Focus } from '@ephox/sugar';

const focus = function (component, focusConfig) {
  if (! focusConfig.ignore()) {
    Focus.focus(component.element());
    focusConfig.onFocus()(component);
  }
};

const blur = function (component, focusConfig) {
  if (! focusConfig.ignore()) {
    Focus.blur(component.element());
  }
};

const isFocused = function (component) {
  return Focus.hasFocus(component.element());
};

export {
  focus,
  blur,
  isFocused
};