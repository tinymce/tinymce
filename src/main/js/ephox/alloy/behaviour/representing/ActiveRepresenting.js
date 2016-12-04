define(
  'ephox.alloy.behaviour.representing.ActiveRepresenting',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.behaviour.representing.RepresentApis',
    'ephox.boulder.api.Objects'
  ],

  function (Behaviour, RepresentApis, Objects) {
    var events = function (repInfo) {
      var load = Behaviour.loadEvent(repInfo, RepresentApis.onLoad);
      return Objects.wrapAll([ load ]);
    };

    return {
      events: events
    };
  }
);