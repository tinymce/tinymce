define(
  'ephox.alloy.behaviour.coupling.CouplingApis',

  [

  ],

  function () {
    var getCoupled = function (component, coupleConfig, coupleState, name) {
      return coupleState.getOrCreate(component, coupleConfig, name);
    };

    return {
      getCoupled: getCoupled
    };
  }
);