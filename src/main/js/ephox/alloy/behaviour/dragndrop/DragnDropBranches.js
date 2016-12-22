define(
  'ephox.alloy.behaviour.dragndrop.DragnDropBranches',

  [
    'ephox.alloy.behaviour.dragndrop.DragStarting',
    'ephox.alloy.behaviour.dragndrop.Dropping'
  ],

  function (DragStarting, Dropping) {
    return {
      'drag': DragStarting,
      'drop': Dropping
    };
  }
);