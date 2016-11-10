define(
  'ephox.alloy.api.behaviour.Dragging',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.highway.Merger',
    'ephox.scullion.Struct'
  ],

  function (BehaviourExport, Merger, Struct) {
    return Merger.deepMerge(
      BehaviourExport.build(
        'dragging',
        [

        ],
        { }
      ),
      {
        dock: Struct.immutable('sensor', 'output')
      }
    );
  }
);