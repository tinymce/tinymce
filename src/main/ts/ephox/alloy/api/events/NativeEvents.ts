import { Fun } from '@ephox/katamari';
import { Constant } from 'ephox/alloy/alien/TypeDefinitions';

const contextmenu = Fun.constant('contextmenu') as Constant;
const touchstart = Fun.constant('touchstart') as Constant;
const touchmove = Fun.constant('touchmove') as Constant;
const touchend = Fun.constant('touchend') as Constant;
const gesturestart = Fun.constant('gesturestart') as Constant;
const mousedown = Fun.constant('mousedown') as Constant;
const mousemove = Fun.constant('mousemove') as Constant;
const mouseout = Fun.constant('mouseout') as Constant;
const mouseup = Fun.constant('mouseup') as Constant;
const mouseover = Fun.constant('mouseover') as Constant;
// Not really a native event as it has to be simulated
const focusin = Fun.constant('focusin') as Constant;
const keydown = Fun.constant('keydown') as Constant;
const input = Fun.constant('input') as Constant;
const change = Fun.constant('change') as Constant;
const focus = Fun.constant('focus') as Constant;
const click = Fun.constant('click') as Constant;
const transitionend = Fun.constant('transitionend') as Constant;
const selectstart = Fun.constant('selectstart') as Constant;

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
};