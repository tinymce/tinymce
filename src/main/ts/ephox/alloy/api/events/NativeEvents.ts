import { Fun } from '@ephox/katamari';

const contextmenu = Fun.constant('contextmenu');
const touchstart = Fun.constant('touchstart');
const touchmove = Fun.constant('touchmove');
const touchend = Fun.constant('touchend');
const gesturestart = Fun.constant('gesturestart');
const mousedown = Fun.constant('mousedown');
const mousemove = Fun.constant('mousemove');
const mouseout = Fun.constant('mouseout');
const mouseup = Fun.constant('mouseup');
const mouseover = Fun.constant('mouseover');
// Not really a native event as it has to be simulated
const focusin = Fun.constant('focusin');
const keydown = Fun.constant('keydown');
const input = Fun.constant('input');
const change = Fun.constant('change');
const focus = Fun.constant('focus');
const click = Fun.constant('click');
const transitionend = Fun.constant('transitionend');
const selectstart = Fun.constant('selectstart');
const paste = Fun.constant('paste');

export {
  contextmenu,
  touchstart,
  touchmove,
  touchend,
  gesturestart,
  mousedown,
  mousemove,
  mouseout,
  mouseup,
  mouseover,

  focusin,

  keydown,

  input,
  change,
  focus,

  click,

  transitionend,
  selectstart,
  paste
};