define(
  'ephox.dragster.detect.Movement',

  [
    'ephox.dragster.detect.InDrag',
    'ephox.dragster.detect.NoDrag'
  ],

  function (InDrag, NoDrag) {

    return function (anchor) {
      var noDragState = NoDrag(anchor);
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

      var onEvent = function (event) {
        dragState.onEvent(event);
      };

      return {
        on: on,
        off: off,
        onEvent: onEvent,
        events: inDragState.events
      };
    };
  }
);
