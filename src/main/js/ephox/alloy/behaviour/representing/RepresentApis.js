define(
  'ephox.alloy.behaviour.representing.RepresentApis',

  [

  ],

  function () {
    var onLoad = function (component, repInfo) {
      setValue(component, repInfo, repInfo.initialValue());
    };

    var setValue = function (component, repInfo, value) {
      console.log('setting', value);
      repInfo.state().set(value);
      repInfo.onSet()(component, value);
    };

    var getValue = function (component, repInfo) {
      return repInfo.state().get();
    };

    return {
      onLoad: onLoad,
      setValue: setValue,
      getValue: getValue
    };
  }
);