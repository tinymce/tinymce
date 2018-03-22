import { Fun } from '@ephox/katamari';
import { StringConstant } from '../../alien/TypeDefinitions';

const contextmenu = Fun.constant('contextmenu') as StringConstant;
const touchstart = Fun.constant('touchstart') as StringConstant;
const touchmove = Fun.constant('touchmove') as StringConstant;
const touchend = Fun.constant('touchend') as StringConstant;
const gesturestart = Fun.constant('gesturestart') as StringConstant;
const mousedown = Fun.constant('mousedown') as StringConstant;
const mousemove = Fun.constant('mousemove') as StringConstant;
const mouseout = Fun.constant('mouseout') as StringConstant;
const mouseup = Fun.constant('mouseup') as StringConstant;
const mouseover = Fun.constant('mouseover') as StringConstant;
// Not really a native event as it has to be simulated
const focusin = Fun.constant('focusin') as StringConstant;
const keydown = Fun.constant('keydown') as StringConstant;
const input = Fun.constant('input') as StringConstant;
const change = Fun.constant('change') as StringConstant;
const focus = Fun.constant('focus') as StringConstant;
const click = Fun.constant('click') as StringConstant;
const transitionend = Fun.constant('transitionend') as StringConstant;
const selectstart = Fun.constant('selectstart') as StringConstant;

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