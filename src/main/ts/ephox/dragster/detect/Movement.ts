import InDrag from './InDrag';
import NoDrag from './NoDrag';



export default <any> function () {
  var noDragState = NoDrag();
  var inDragState = InDrag();
  var dragState = noDragState;

  var on = function () {
    dragState.reset();
    dragState = inDragState;
  };

  var off = function () {
    dragState.reset();
    dragState = noDragState;
  };

  var onEvent = function (event, mode) {
    dragState.onEvent(event, mode);
  };

  var isOn = function () {
    return dragState === inDragState;
  };

  return {
    on: on,
    off: off,
    isOn: isOn,
    onEvent: onEvent,
    events: inDragState.events
  };
};