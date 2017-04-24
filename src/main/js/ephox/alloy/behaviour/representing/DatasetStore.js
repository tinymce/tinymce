define(
  'ephox.alloy.behaviour.representing.DatasetStore',

  [
    'ephox.alloy.behaviour.representing.RepresentState',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects'
  ],

  function (RepresentState, FieldSchema, Objects) {
    return [
      FieldSchema.option('initialValue'),
      FieldSchema.strict('getFallbackEntry'),
      FieldSchema.strict('getDataKey'),
      FieldSchema.strict('setData'),
      FieldSchema.state('manager', function () {
        var setValue = function (component, repConfig, repState, data) {
          var dataKey = repConfig.store().getDataKey()
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

        return {
          setValue: setValue,
          getValue: getValue,
          onLoad: onLoad,
          state: RepresentState.dataset
        };
      })
    ];
  }
);
