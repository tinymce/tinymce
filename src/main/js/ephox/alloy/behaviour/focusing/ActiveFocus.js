define(
  'ephox.alloy.behaviour.focusing.ActiveFocus',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.focusing.FocusApis',
    'ephox.alloy.dom.DomModification'
  ],

  function (AlloyEvents, SystemEvents, FocusApis, DomModification) {
    var exhibit = function (base, focusConfig) {
      if (focusConfig.ignore()) return DomModification.nu({ });
      else return DomModification.nu({
        attributes: {
          'tabindex': '-1'
        }
      });
    };

    var events = function (focusConfig) {
      return AlloyEvents.derive([
        AlloyEvents.run(SystemEvents.focus(), function (component, simulatedEvent) {
          FocusApis.focus(component, focusConfig);
          simulatedEvent.stop();
        })
      ]);
    };

    return {
      exhibit: exhibit,
      events: events
    };
  }
);