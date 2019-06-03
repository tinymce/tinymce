const isKey = function (key: number) {
  return function (keycode: number) {
    return keycode === key;
  };
};

const isUp = isKey(38);
const isDown = isKey(40);
const isNavigation = function (keycode: number) {
  return keycode >= 37 && keycode <= 40;
};

export default {
  ltr: {
    // We need to move KEYS out of keytar and into something much more low-level.
    isBackward: isKey(37),
    isForward: isKey(39)
  },
  rtl: {
    isBackward: isKey(39),
    isForward: isKey(37)
  },
  isUp,
  isDown,
  isNavigation
};