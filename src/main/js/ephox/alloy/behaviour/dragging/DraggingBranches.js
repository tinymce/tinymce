define(
  'ephox.alloy.behaviour.dragging.DraggingBranches',

  [
    'ephox.alloy.dragging.mouse.MouseDragging',
    'ephox.alloy.dragging.touch.TouchDragging'
  ],

  function (MouseDragging, TouchDragging) {
    return {
      'mouse': MouseDragging,
      'touch': TouchDragging
    };
  }
);