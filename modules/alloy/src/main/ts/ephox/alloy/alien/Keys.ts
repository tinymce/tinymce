const BACKSPACE: () => number[] = () => [8];
const TAB: () => number[] = () => [9];
const ENTER: () => number[] = () => [13];
const SHIFT: () => number[] = () => [16];
const CTRL: () => number[] = () => [17];
const ALT: () => number[] = () => [18];
const CAPSLOCK: () => number[] = () => [20];
const ESCAPE: () => number[] = () => [27];
const SPACE: () => number[] = () => [32];
const PAGEUP: () => number[] = () => [33];
const PAGEDOWN: () => number[] = () => [34];
const END: () => number[] = () => [35];
const HOME: () => number[] = () => [36];
const LEFT: () => number[] = () => [37];
const UP: () => number[] = () => [38];
const RIGHT: () => number[] = () => [39];
const DOWN: () => number[] = () => [40];
const INSERT: () => number[] = () => [45];
const DEL: () => number[] = () => [46];
const META: () => number[] = () => [91, 93, 224];
const F10: () => number[] = () => [121];

export {
  BACKSPACE,
  TAB ,
  ENTER,
  SHIFT,
  CTRL,
  ALT,
  CAPSLOCK,
  ESCAPE,
  SPACE,
  PAGEUP,
  PAGEDOWN,
  END,
  HOME,
  LEFT,
  UP,
  RIGHT,
  DOWN,
  INSERT,
  DEL,
  META,
  F10
};
