define(
  'ephox.darwin.api.SelectionDirection',

  [

  ],

  function () {
    var isKey = function (key) {
      return function (keycode) {
        return keycode === key;
      };
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
      }
    };
  }
);