define(
  'ephox.alloy.behaviour.transitioning.ActiveTransitioning',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.transitioning.TransitionApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects'
  ],

  function (SystemEvents, TransitionApis, EventHandler, Objects) {
    var getRoute = function (component, transConfig, transState) {

    }
    var events = function (transConfig, transState) {
      return Objects.wrapAll([
        {
          key: 'transitionend',
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              var raw = simulatedEvent.event().raw();

              var start



              if (raw.propertyName === transConfig.property()) {
                // disable transitions immediately (Safari animates the dimension removal below)
                var route = TransitionApis.getRoute(component, transConfig, transState);
                TransitionApis.disableTransition(component, transConfig, transState);
                transConfig.onTransition()(component, route);
              }
            }
          })
        },

        {
          key: SystemEvents.attachedToDom(),
          value: EventHandler.nu({
            run: function (comp, se) {
              TransitionApis.jumpTo(comp, transConfig, transState, transConfig.initialState());
            }
          })
        }
      ]);
    };

    return {
      events: events
    };
  }
);
