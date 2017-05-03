define(
  'ephox.alloy.behaviour.transitioning.TransitionApis',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Class'
  ],

  function (Fun, Attr, Class) {
    var disableTransition = function (comp, transConfig, transState) {
      Class.remove(comp, transConfig.transitionClass());
      Attr.remove(comp, transConfig.destinationAttr());
    };

    var getRoute = function (comp, tc, ts) {
      return {
        destination: Fun.constant(Attr.get(comp, tc.destinationAttr()))
      };
    };

    return {
      disableTransition: disableTransition,
      getRoute: getRoute
    }  
  }
);
