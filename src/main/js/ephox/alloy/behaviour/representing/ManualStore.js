define(
  'ephox.alloy.behaviour.representing.ManualStore',

  [
    'ephox.alloy.behaviour.common.NoState',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (NoState, FieldSchema, Fun) {
    return [
      FieldSchema.strict('getValue'),
      FieldSchema.defaulted('setValue', Fun.noop),
      FieldSchema.option('initialValue'),
      FieldSchema.state('manager', function () {
        var getValue = function (component, repConfig, repState) {
          return repConfig.store().getValue()(component);
        };

        var setValue = function (component, repConfig, repState, data) {
          console.log('setting value', data);
          repConfig.store().setValue()(component, data);
          repConfig.onSetValue()(component, data);
        };

        var onLoad = function (component, repConfig, repState) {
          repConfig.store().initialValue().each(function (data) {
            repConfig.store().setValue()(component, data);
          });
        };

        return {
          setValue: setValue,
          getValue: getValue,
          onLoad: onLoad,
          state: NoState.init
        };
      })
    ];
  }
);
