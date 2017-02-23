define(
  'ephox.alloy.behaviour.focusing.FocusApis',

  [
    'ephox.sugar.api.dom.Focus'
  ],

  function (Focus) {
    var focus = function (component, focusInfo) {
      if (! focusInfo.ignore()) {
        Focus.focus(component.element());
        focusInfo.onFocus()(component);
      }
    };

    var blur = function (component, focusInfo) {
      if (! focusInfo.ignore()) {
        Focus.blur(component.element());
      }
    };

    var isFocused = function (component) {
      return Focus.hasFocus(component.element());
    };

    return {
      focus: focus,
      blur: blur,
      isFocused: isFocused
    };
  }
);