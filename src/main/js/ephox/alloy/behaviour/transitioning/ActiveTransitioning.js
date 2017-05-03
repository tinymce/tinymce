define(
  'ephox.alloy.behaviour.transitioning.ActiveTransitioning',

  [
    'ephox.alloy.behaviour.transitioning.TransitionApis',
    'ephox.alloy.construct.EventHandler'
  ],

  function (TransitionApis, EventHandler) {
    var events = function (transConfig, transState) {
      return {
        'transitionend': EventHandler.nu({
          run: function (component, simulatedEvent) {
            var raw = simulatedEvent.event().raw();
            if (raw.propertyName === transConfig.property()) {
               // disable transitions immediately (Safari animates the dimension removal below)
              var route = TransitionApis.getRoute(component, transConfig, transState);
              TransitionApis.disableTransition(component, transConfig, transState);
              transConfig.onTransition()(component, route);
            }
          }
        })
      };
    };

    return {
      events: events
    };
  }
);
