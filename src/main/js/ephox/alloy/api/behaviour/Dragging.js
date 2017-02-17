define(
  'ephox.alloy.api.behaviour.Dragging',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.dragging.DraggingBranches',
    'ephox.katamari.api.Struct'
  ],

  function (Behaviour, DraggingBranches, Struct) {
    return Behaviour.createModes(
      'mode',
      DraggingBranches,
      'dragging',
      {
        events: function (dragInfo) {
          var dragger = dragInfo.dragger();
          return dragger.handlers(dragInfo);
        }
      },
      { },
      {
        // Extra. Does not need component as input.
        snap: Struct.immutableBag([ 'sensor', 'range', 'output' ], [ 'extra' ])

      }
    );
  }
);