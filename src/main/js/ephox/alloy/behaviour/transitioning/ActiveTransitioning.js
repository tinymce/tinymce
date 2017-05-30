define(
  'ephox.alloy.behaviour.transitioning.ActiveTransitioning',

  [
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.behaviour.transitioning.TransitionApis'
  ],

  function (AlloyEvents, NativeEvents, TransitionApis) {
    var events = function (transConfig, transState) {
      return AlloyEvents.derive([
        AlloyEvents.run(NativeEvents.transitionend(), function (component, simulatedEvent) {
          var raw = simulatedEvent.event().raw();
          TransitionApis.getCurrentRoute(component, transConfig, transState).each(function (route) {
            TransitionApis.findRoute(component, transConfig, transState, route).each(function (rInfo) {
              rInfo.transition().each(function (rTransition) {
                if (raw.propertyName === rTransition.property()) {
                  TransitionApis.jumpTo(component, transConfig, transState, route.destination());
                  transConfig.onTransition()(component, route);
                }
              });
            });
          });
        }),

        AlloyEvents.runOnAttached(function (comp, se) {
          TransitionApis.jumpTo(comp, transConfig, transState, transConfig.initialState());
        })
      ]);
    };

    return {
      events: events
    };
  }
);
