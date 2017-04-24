define(
  'ephox.alloy.behaviour.representing.MemoryStore',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Cell'
  ],

  function (FieldSchema, Cell) {
    // Find a better way of storing this.
    var state = function () {
      return Cell(null);
    };

    var manager = function () {
      var setValue = function (component, repInfo, data) {
        repInfo.store().state().set(data);
        repInfo.onSetValue()(component, data);
      };

      var getValue = function (component, repInfo) {
        return repInfo.store().state().get();
      };

      var onLoad = function (component, repInfo) {
        var current = repInfo.store().state().get();
        repInfo.store().initialValue().each(function (initVal) {
          // TODO: Maybe should call onSetValue here?
          if (current === null) repInfo.store().state().set(initVal);
        });
      };

      return {
        setValue: setValue,
        getValue: getValue,
        onLoad: onLoad
      };
    };

    return [
      FieldSchema.state('state', state),
      FieldSchema.option('initialValue'),      
      FieldSchema.state('manager', manager)
    ];
  }
);
