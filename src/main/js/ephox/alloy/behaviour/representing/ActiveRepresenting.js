define(
  'ephox.alloy.behaviour.representing.ActiveRepresenting',

  [
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.alloy.behaviour.representing.RepresentApis',
    'ephox.boulder.api.Objects'
  ],

  function (Behaviour, RepresentApis, Objects) {
    var events = function (repConfig, repState) {
      return Objects.wrapAll([
        Behaviour.loadEvent(repConfig, repState, RepresentApis.onLoad)
      ]);
    };

    return {
      events: events
    };
  }
);