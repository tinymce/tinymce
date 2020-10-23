import { Fun } from '@ephox/katamari';

const constant = Fun.constant;

const contextmenu = constant('contextmenu');
const touchstart = constant('touchstart');
const touchmove = constant('touchmove');
const touchend = constant('touchend');
const touchcancel = constant('touchcancel');
const gesturestart = constant('gesturestart');
const mousedown = constant('mousedown');
const mousemove = constant('mousemove');
const mouseout = constant('mouseout');
const mouseup = constant('mouseup');
const mouseover = constant('mouseover');
// Not really a native event as it has to be simulated
const focusin = constant('focusin');
const focusout = constant('focusout');
const keydown = constant('keydown');
const keyup = constant('keyup');
const input = constant('input');
const change = constant('change');
const focus = constant('focus');
const click = constant('click');
const transitionend = constant('transitionend');
const selectstart = constant('selectstart');
const paste = constant('paste');
const dragover = constant('dragover');
const dragend = constant('dragend');
const dragstart = constant('dragstart');
const dragleave = constant('dragleave');
const dragenter = constant('dragenter');
const drop = constant('drop');
const drag = constant('drag');

export {
  contextmenu,
  touchstart,
  touchmove,
  touchend,
  touchcancel,
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
