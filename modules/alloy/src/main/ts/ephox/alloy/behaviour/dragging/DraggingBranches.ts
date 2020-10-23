import * as MouseDragging from '../../dragging/mouse/MouseDragging';
import * as MouseOrTouchDragging from '../../dragging/mouseortouch/MouseOrTouchDragging';
import * as TouchDragging from '../../dragging/touch/TouchDragging';

const mouse = MouseDragging.schema;
const touch = TouchDragging.schema;
const mouseOrTouch = MouseOrTouchDragging.schema;

export {
  mouse,
  touch,
  mouseOrTouch
};
