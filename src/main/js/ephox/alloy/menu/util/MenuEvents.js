define(
  'ephox.alloy.menu.util.MenuEvents',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    var focusEvent = 'alloy.menu-focus';

    return {
      focus: Fun.constant(focusEvent)
    };
  }
);