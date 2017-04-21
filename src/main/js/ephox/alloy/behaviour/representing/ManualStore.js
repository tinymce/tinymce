define(
  'ephox.alloy.behaviour.representing.ManualStore',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Fun) {
    return [
      FieldSchema.strict('getValue'),
      FieldSchema.defaulted('setValue', Fun.noop),
      FieldSchema.option('initialValue'),
      FieldSchema.state('manager', function () {
        var getValue = function (component, repInfo) {
          return repInfo.store().getValue()(component);
        };

        var setValue = function (component, repInfo, data) {
          repInfo.store().setValue()(component, data);
          repInfo.onSetValue()(component, data);
        };

        var onLoad = function (component, repInfo) {
          repInfo.store().initialValue().each(function (data) {
            repInfo.store().setValue()(component, data);
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
