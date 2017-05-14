define(
  'ephox.alloy.behaviour.representing.DatasetStore',

  [
    'ephox.alloy.behaviour.representing.RepresentState',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun'
  ],

  function (RepresentState, Fields, FieldSchema, Objects, Fun) {
    var setValue = function (component, repConfig, repState, data) {
      // TODO: Really rethink this mode.
      var dataKey = repConfig.store().getDataKey();
      repState.set({ });
      repConfig.store().setData()(component, data);
      repConfig.onSetValue()(component, data);
    };

    var getValue = function (component, repConfig, repState) {
      var key = repConfig.store().getDataKey()(component);
      var dataset = repState.get();
      return Objects.readOptFrom(dataset, key).fold(function () {
        return repConfig.store().getFallbackEntry()(key);
      }, function (data) {
        return data;
      });
    };

    var onLoad = function (component, repConfig, repState) {
      repConfig.store().initialValue().each(function (data) {
        setValue(component, repConfig, repState, data);
      });
    };

    var onUnload = function (component, repConfig, repState) {
      repState.set({ });
    };

    return [
      FieldSchema.option('initialValue'),
      FieldSchema.strict('getFallbackEntry'),
      FieldSchema.strict('getDataKey'),
      FieldSchema.strict('setData'),
      Fields.output('manager', {
        setValue: setValue,
        getValue: getValue,
        onLoad: onLoad,
        onUnload: onUnload,
        state: RepresentState.dataset
      })
    ];
  }
);
