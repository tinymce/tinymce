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
        exhibit: function (base, dragInfo) {
          var instance = dragInfo.instance();
          return instance.exhibit(base, dragInfo);
        },


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