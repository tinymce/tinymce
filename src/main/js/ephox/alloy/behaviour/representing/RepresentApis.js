define(
  'ephox.alloy.behaviour.representing.RepresentApis',

  [
    
  ],

  function () {
    var onLoad = function (component, repInfo) {
      repInfo.store().manager().onLoad(component, repInfo);
    };

    var setValue = function (component, repInfo, data) {
      repInfo.store().manager().setValue(component, repInfo, data);
    };

    var getValue = function (component, repInfo) {
      return repInfo.store().manager().getValue(component, repInfo);
    };

    return {
      onLoad: onLoad,
      setValue: setValue,
      getValue: getValue
    };
  }
);