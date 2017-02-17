define(
  'ephox.alloy.behaviour.dragging.DraggingBranches',

  [
    'ephox.alloy.dragging.MouseDragging'
  ],

  function (MouseDragging) {
    return {
      'mouse': MouseDragging
    };
  }
);