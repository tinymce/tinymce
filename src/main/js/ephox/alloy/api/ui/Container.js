define(
  'ephox.alloy.api.ui.Container',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.ui.schema.ContainerSchema',
    'ephox.highway.Merger'
  ],

  function (UiBuilder, ContainerSchema, Merger) {
    var make = function (_detail, spec) {
      return Merger.deepMerge({
        dom: {
          tag: 'div',
          attributes: {
            role: 'presentation'
          }
        }
      }, spec);
    };

    var sketch = function (spec) {
      return UiBuilder.single(ContainerSchema.name(), ContainerSchema.schema(), make, spec);
    };

    return {
      sketch: sketch
    };
  }
);