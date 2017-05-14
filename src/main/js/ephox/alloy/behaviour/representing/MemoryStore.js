define(
  'ephox.alloy.behaviour.representing.MemoryStore',

  [
    'ephox.alloy.behaviour.representing.RepresentState',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema'
  ],

  function (RepresentState, Fields, FieldSchema) {
    var setValue = function (component, repConfig, repState, data) {
      repState.set(data);
      repConfig.onSetValue()(component, data);
    };

    var getValue = function (component, repConfig, repState) {
      return repState.get();
    };

    var onLoad = function (component, repConfig, repState) {
      repConfig.store().initialValue().each(function (initVal) {
        if (repState.isNotSet()) repState.set(initVal);
      });
    };

    var onUnload = function (component, repConfig, repState) {
      repState.clear();
    };

    return [
      FieldSchema.option('initialValue'),
      Fields.output('manager', {
        setValue: setValue,
        getValue: getValue,
        onLoad: onLoad,
        onUnload: onUnload,
        state: RepresentState.memory
      })
    ];
  }
);
