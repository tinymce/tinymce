define(
  'ephox.alloy.positioning.PopupSpi',

  [
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Css'
  ],

  function (Arr, Fun, Css) {
    // TODO: Support RTL mode.
    return function (component) {
      var position = function (offset) {
        reset();
        Css.setAll(component.element(), {
          left: offset.left() + 'px',
          top: offset.top() + 'px'
        });
      };

      var reset = function () {
        Arr.each(['top', 'left'], function (r) {
          Css.remove(component.element(), r);
        });
      };

      return {
        element: Fun.constant(component.element()),
        panel: Fun.constant(component.element()),
        positionLtr: position,
        positionRtl: position
      };
    };
  }
);