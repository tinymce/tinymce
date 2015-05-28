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
        isLeft: isKey(37),
        isRight: isKey(39)
      },
      rtl: {
        isLeft: isKey(39),
        isRight: isKey(37)
      }
    };
  }
);