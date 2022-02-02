import { Fun } from '@ephox/katamari';

const constant = Fun.constant;

const contextmenu = constant('contextmenu' as const);
const touchstart = constant('touchstart' as const);
const touchmove = constant('touchmove' as const);
const touchend = constant('touchend' as const);
const touchcancel = constant('touchcancel' as const);
const gesturestart = constant('gesturestart' as const);
const mousedown = constant('mousedown' as const);
const mousemove = constant('mousemove' as const);
const mouseout = constant('mouseout' as const);
const mouseup = constant('mouseup' as const);
const mouseover = constant('mouseover' as const);
// Not really a native event as it has to be simulated
const focusin = constant('focusin' as const);
const focusout = constant('focusout' as const);
const keydown = constant('keydown' as const);
const keyup = constant('keyup' as const);
const input = constant('input' as const);
const change = constant('change' as const);
const focus = constant('focus' as const);
const click = constant('click' as const);
const transitioncancel = constant('transitioncancel' as const);
const transitionend = constant('transitionend' as const);
const transitionstart = constant('transitionstart' as const);
const selectstart = constant('selectstart' as const);
const paste = constant('paste' as const);
const dragover = constant('dragover' as const);
const dragend = constant('dragend' as const);
const dragstart = constant('dragstart' as const);
const dragleave = constant('dragleave' as const);
const dragenter = constant('dragenter' as const);
const drop = constant('drop' as const);
const drag = constant('drag' as const);

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

  transitioncancel,
  transitionend,
  transitionstart,

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
