const isKey = (key: number) => {
  return (keycode: number): boolean => {
    return keycode === key;
  };
};

const isUp = isKey(38);
const isDown = isKey(40);
const isNavigation = (keycode: number): boolean => {
  return keycode >= 37 && keycode <= 40;
};

const ltr = {
  // We need to move KEYS out of keytar and into something much more low-level.
  isBackward: isKey(37),
  isForward: isKey(39)
};

const rtl = {
  isBackward: isKey(39),
  isForward: isKey(37)
};

export {
  ltr,
  rtl,
  isUp,
  isDown,
  isNavigation
};
