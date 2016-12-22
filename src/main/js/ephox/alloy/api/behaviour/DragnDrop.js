define(
  'ephox.alloy.api.behaviour.DragnDrop',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.dragndrop.DragnDropBranches'
  ],

  function (BehaviourExport, DragnDropBranches) {
    return BehaviourExport.modeSanta(
      'mode',
      DragnDropBranches,
      'dragndrop',
      {
        events: function (dragInfo) {
          var instance = dragInfo.instance();
          return instance.handlers(dragInfo);
        }
      },
      { },
      {
        
      }
    );
  }
);