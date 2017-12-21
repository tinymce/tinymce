import { Fun } from '@ephox/katamari';



export default <any> {
  contextmenu: Fun.constant('contextmenu'),
  touchstart: Fun.constant('touchstart'),
  touchmove: Fun.constant('touchmove'),
  touchend: Fun.constant('touchend'),
  gesturestart: Fun.constant('gesturestart'),
  mousedown: Fun.constant('mousedown'),
  mousemove: Fun.constant('mousemove'),
  mouseout: Fun.constant('mouseout'),
  mouseup: Fun.constant('mouseup'),
  mouseover: Fun.constant('mouseover'),
  // Not really a native event as it has to be simulated
  focusin: Fun.constant('focusin'),

  keydown: Fun.constant('keydown'),

  input: Fun.constant('input'),
  change: Fun.constant('change'),
  focus: Fun.constant('focus'),

  click: Fun.constant('click'),

  transitionend: Fun.constant('transitionend'),
  selectstart: Fun.constant('selectstart')
};