import * as MouseDragging from '../../dragging/mouse/MouseDragging';
import * as MouseOrTouchDragging from '../../dragging/mouseortouch/MouseOrTouchDragging';
import * as PointerDragging from '../../dragging/pointer/PointerDragging';
import * as TouchDragging from '../../dragging/touch/TouchDragging';

const mouse = MouseDragging.schema;
const touch = TouchDragging.schema;
const mouseOrTouch = MouseOrTouchDragging.schema;
const pointer = PointerDragging.schema;

export {
  mouse,
  touch,
  mouseOrTouch,
  pointer
};
