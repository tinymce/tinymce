define(
  'ephox.alloy.api.behaviour.Dragging',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.dragging.DraggingBranches',
    'ephox.scullion.Struct'
  ],

  function (BehaviourExport, DraggingBranches, Struct) {
    return BehaviourExport.modeSanta(
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