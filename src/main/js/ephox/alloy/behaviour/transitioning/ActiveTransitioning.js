define(
  'ephox.alloy.behaviour.transitioning.ActiveTransitioning',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.transitioning.TransitionApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun'
  ],

  function (EventRoot, SystemEvents, TransitionApis, EventHandler, Objects, Fun) {
    var findRoute = function (component, transConfig, route) {
      return Objects.readOptFrom(transConfig.routes(), route.start()).map(Fun.apply).bind(function (sConfig) {
        return Objects.readOptFrom(sConfig, route.destination()).map(Fun.apply);
      });
    };

    var events = function (transConfig, transState) {
      return Objects.wrapAll([
        {
          key: 'transitionend',
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              var raw = simulatedEvent.event().raw();
              TransitionApis.getCurrentRoute(component, transConfig, transState).each(function (route) {
                TransitionApis.findRoute(component, transConfig, transState, route).each(function (rInfo) {
                  if (raw.propertyName = rInfo.transition()) {
                    TransitionApis.jumpTo(component, transConfig, transState, route.destination());
                    transConfig.onTransition()(component, route);
                  }
                });
              });
            }
          })
        },

        {
          key: SystemEvents.attachedToDom(),
          value: EventHandler.nu({
            run: function (comp, se) {
              if (EventRoot.isSource(comp, se)) {
                TransitionApis.jumpTo(comp, transConfig, transState, transConfig.initialState());
              }
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
