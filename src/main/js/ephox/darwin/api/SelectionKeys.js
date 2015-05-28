define(
  'ephox.darwin.api.SelectionKeys',

  [

  ],

  function () {
    var isKey = function (key) {
      return function (keycode) {
        return keycode === key;
      };
    };

    var isUp = isKey(38);
    var isDown = isKey(40);
    var isNavigation = function (keycode) {
      return keycode >= 37 && keycode <= 40;
    };

    return {
      ltr: {
        // We need to move KEYS out of keytar and into something much more low-level.
        isBackward: isKey(37),
        isForward: isKey(39)
      },
      rtl: {
        isBackward: isKey(39),
        isForward: isKey(37)
      },
      isUp: isUp,
      isDown: isDown,
      isNavigation: isNavigation
    };
  }
);