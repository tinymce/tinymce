define(
  'ephox.alloy.behaviour.representing.ActiveRepresenting',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.behaviour.representing.RepresentApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (Behaviour, RepresentApis, EventHandler, Objects) {
    var events = function (repInfo) {
      var load = Behaviour.loadEvent(repInfo, RepresentApis.onLoad);

      var onChange = repInfo.interactive().map(function (interactive) {
        return {
          key: interactive.event(),
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              var value = interactive.process()(component, simulatedEvent.event());
              RepresentApis.setValue(component, repInfo, value);
            }
          })
        };
      }).toArray();

      return Objects.wrapAll([ load ].concat(onChange));
    };

    return {
      events: events
    };
  }
);