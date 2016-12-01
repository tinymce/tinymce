define(
  'ephox.alloy.behaviour.coupling.CouplingApis',

  [

  ],

  function () {
    var getCoupled = function (component, coupledInfo, name) {
      return coupledInfo.state().getOrCreate(component, coupledInfo, name);
    };

    return {
      getCoupled: getCoupled
    };
  }
);