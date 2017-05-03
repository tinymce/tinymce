define(
  'ephox.alloy.behaviour.transitioning.TransitionApis',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class'
  ],

  function (Fun, Attr, Class) {
    var disableTransition = function (comp, transConfig, transState) {
      Class.remove(comp.element(), transConfig.transitionClass());
      Attr.remove(comp.element(), transConfig.destinationAttr());
    };

    var getRoute = function (comp, transConfig, transState) {
      return {
        start: Fun.constant(Attr.get(comp.element(), transConfig.stateAttr())),
        destination: Fun.constant(Attr.get(comp.element(), transConfig.destinationAttr()))
      };
    };

    var jumpTo = function (comp, transConfig, transState, destination) {
      disableTransition(comp, transConfig, transState);
      Attr.set(comp.element(), transConfig.stateAttr(), destination);
    };

    var progressTo = function (comp, transConfig, transState, destination) {
      Class.add(comp.element(), transConfig.transitionClass());
      Attr.set(comp.element(), transConfig.destinationAttr(), destination);
    };

    return {
      disableTransition: disableTransition,
      getRoute: getRoute,
      jumpTo: jumpTo,
      progressTo: progressTo
    };
  }
);
