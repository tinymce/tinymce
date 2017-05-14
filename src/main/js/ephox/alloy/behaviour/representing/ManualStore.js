define(
  'ephox.alloy.behaviour.representing.ManualStore',

  [
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (NoState, Fields, FieldSchema, Fun) {
    var getValue = function (component, repConfig, repState) {
      return repConfig.store().getValue()(component);
    };

    var setValue = function (component, repConfig, repState, data) {
      repConfig.store().setValue()(component, data);
      repConfig.onSetValue()(component, data);
    };

    var onLoad = function (component, repConfig, repState) {
      repConfig.store().initialValue().each(function (data) {
        repConfig.store().setValue()(component, data);
      });
    };

    return [
      FieldSchema.strict('getValue'),
      FieldSchema.defaulted('setValue', Fun.noop),
      FieldSchema.option('initialValue'),
      Fields.output('manager', {
        setValue: setValue,
        getValue: getValue,
        onLoad: onLoad,
        onUnload: Fun.noop,
        state: NoState.init
      })
    ];
  }
);
