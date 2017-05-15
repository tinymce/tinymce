define(
  'ephox.alloy.behaviour.representing.ActiveRepresenting',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.alloy.behaviour.representing.RepresentApis'
  ],

  function (AlloyEvents, Behaviour, RepresentApis) {
    var events = function (repConfig, repState) {
      var es = repConfig.resetOnDom() ? [
        AlloyEvents.runOnAttached(function (comp, se) {
          RepresentApis.onLoad(comp, repConfig, repState);
        }),
        AlloyEvents.runOnDetached(function (comp, se) {
          RepresentApis.onUnload(comp, repConfig, repState);
        })
      ] : [
        Behaviour.loadEvent(repConfig, repState, RepresentApis.onLoad)
      ];

      return AlloyEvents.derive(es);
    };

    return {
      events: events
    };
  }
);