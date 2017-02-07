define(
  'ephox.alloy.api.ui.Container',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.schema.ContainerSchema',
    'ephox.highway.Merger'
  ],

  function (UiSketcher, ContainerSchema, Merger) {
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
      return UiSketcher.single(ContainerSchema.name(), ContainerSchema.schema(), make, spec);
    };

    return {
      sketch: sketch
    };
  }
);