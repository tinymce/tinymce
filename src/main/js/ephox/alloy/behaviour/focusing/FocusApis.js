import { Focus } from '@ephox/sugar';

var focus = function (component, focusConfig) {
  if (! focusConfig.ignore()) {
    Focus.focus(component.element());
    focusConfig.onFocus()(component);
  }
};

var blur = function (component, focusConfig) {
  if (! focusConfig.ignore()) {
    Focus.blur(component.element());
  }
};

var isFocused = function (component) {
  return Focus.hasFocus(component.element());
};

export default <any> {
  focus: focus,
  blur: blur,
  isFocused: isFocused
};