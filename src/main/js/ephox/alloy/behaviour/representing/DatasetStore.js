define(
  'ephox.alloy.behaviour.representing.DatasetStore',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Objects, Cell, Fun) {
    return [
      FieldSchema.state('dataset', Fun.constant(Cell({ }))),
      FieldSchema.option('initialValue'),
      FieldSchema.strict('getFallbackEntry'),
      FieldSchema.strict('getDataKey'),
      FieldSchema.strict('setData'),
      FieldSchema.state('manager', function () {
        var setValue = function (component, repInfo, data) {
          repInfo.store().dataset().set({ });
          repInfo.store().setData()(component, data);
          repInfo.onSetValue()(component, data);
        };

        var getValue = function (component, repInfo) {
          var key = repInfo.store().getDataKey()(component);
          var dataset = repInfo.store().dataset().get();
          return Objects.readOptFrom(dataset, key).fold(function () {
            return repInfo.store().getFallbackEntry()(key);
          }, function (data) {
            return data;
          });
        };

        var onLoad = function (component, repInfo) {
          repInfo.store().initialValue().each(function (data) {
            setValue(component, repInfo, data);
          });
        };

        return {
          setValue: setValue,
          getValue: getValue,
          onLoad: onLoad
        };
      })
    ];
  }
);
