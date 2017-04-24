define(
  'ephox.alloy.behaviour.representing.MemoryStore',

  [
    'ephox.alloy.behaviour.representing.RepresentState',
    'ephox.boulder.api.FieldSchema'
  ],

  function (RepresentState, FieldSchema) {
    var manager = function () {
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

      return {
        setValue: setValue,
        getValue: getValue,
        onLoad: onLoad,
        state: RepresentState.memory
      };
    };

    return [
      FieldSchema.option('initialValue'),      
      FieldSchema.state('manager', manager)
    ];
  }
);
