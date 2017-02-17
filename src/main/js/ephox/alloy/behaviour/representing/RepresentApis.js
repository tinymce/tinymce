define(
  'ephox.alloy.behaviour.representing.RepresentApis',

  [
    'ephox.perhaps.Result'
  ],

  function (Result) {
    var extractValue = function (component, repInfo, data) {
      return repInfo.extractValue().fold(function () {
        return Result.value(data);
      }, function (f) {
        return f(component, data);
      });
    };

    var onLoad = function (component, repInfo) {
      repInfo.store().manager().onLoad(component, repInfo);
    };

    var setValue = function (component, repInfo, data) {
      extractValue(component, repInfo, data).each(function (newData) {
        repInfo.store().manager().setValue(component, repInfo, newData);
        repInfo.onSet()(component, newData);
      });
    };

    var getValue = function (component, repInfo) {
      return repInfo.store().manager().getValue(component, repInfo);
    };

    return {
      onLoad: onLoad,
      setValue: setValue,
      getValue: getValue,
      extractValue: extractValue
    };
  }
);