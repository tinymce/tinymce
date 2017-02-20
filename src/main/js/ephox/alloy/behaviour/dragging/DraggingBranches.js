define(
  'ephox.alloy.behaviour.dragging.DraggingBranches',

  [
    'ephox.alloy.dragging.mouse.MouseDragging'
  ],

  function (MouseDragging) {
    return {
      'mouse': MouseDragging
    };
  }
);