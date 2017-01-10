define(
  'ephox.alloy.api.behaviour.DragnDrop',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.dragndrop.DragnDropBranches'
  ],

  function (Behaviour, DragnDropBranches) {
    return Behaviour.createModes(
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