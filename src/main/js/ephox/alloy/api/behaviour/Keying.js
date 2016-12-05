define(
  'ephox.alloy.api.behaviour.Keying',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.keyboard.KeyboardBranches'
  ],

  function (BehaviourExport, KeyboardBranches) {
    // These APIs are going to be interesting because they are not
    // available for all keying modes
    return BehaviourExport.modeSanta(
      'mode',
      KeyboardBranches,
      'keying',
      {
        events: function (keyInfo) {
          var handler = keyInfo.handler();
          return handler.toEvents(keyInfo);
        }
      },
      {
        // Missing APIs        

      },
      { }
    );
  }
);