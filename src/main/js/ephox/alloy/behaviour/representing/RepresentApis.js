define(
  'ephox.alloy.behaviour.representing.RepresentApis',

  [
    
  ],

  function () {
    var onLoad = function (component, repConfig, repState) {
      repConfig.store().manager().onLoad(component, repConfig, repState);
    };

    var setValue = function (component, repConfig, repState, data) {
      repConfig.store().manager().setValue(component, repConfig, repState, data);
    };

    var getValue = function (component, repConfig, repState) {
      return repConfig.store().manager().getValue(component, repConfig, repState);
    };

    return {
      onLoad: onLoad,
      setValue: setValue,
      getValue: getValue
    };
  }
);