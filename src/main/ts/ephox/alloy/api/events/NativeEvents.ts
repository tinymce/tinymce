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
const focusout = Fun.constant('focusout');
const keydown = Fun.constant('keydown');
const keyup = Fun.constant('keyup');
const input = Fun.constant('input');
const change = Fun.constant('change');
const focus = Fun.constant('focus');
const click = Fun.constant('click');
const transitionend = Fun.constant('transitionend');
const selectstart = Fun.constant('selectstart');
const paste = Fun.constant('paste');
const dragover = Fun.constant('dragover');
const dragend = Fun.constant('dragend');
const dragstart = Fun.constant('dragstart');
const dragleave = Fun.constant('dragleave');
const dragenter = Fun.constant('dragenter');
const drop = Fun.constant('drop');
const drag = Fun.constant('drag');

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
  focusout,

  keydown,
  keyup,

  input,
  change,
  focus,

  click,

  transitionend,
  selectstart,
  paste,

  dragover,
  dragend,
  dragstart,
  dragleave,
  dragenter,
  drop,
  drag
};