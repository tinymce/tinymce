define(
  'ephox.alloy.menu.util.MenuEvents',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    var focusEvent = 'alloy.menu-focus';

    return {
      focus: Fun.constant(focusEvent)
    };
  }
);