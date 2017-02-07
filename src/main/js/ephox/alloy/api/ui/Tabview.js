define(
  'ephox.alloy.api.ui.Tabview',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.schema.TabviewSchema'
  ],

  function (UiSketcher, TabviewSchema) {
    var schema = TabviewSchema.schema();
    var partTypes = TabviewSchema.parts();

    var make = function (detail, components, spec, externals) {
      return {
        dom: {
          tag: 'div',
          attributes: {
            role: 'tabpanel'
          }
        },

        behaviours: {
          replacing: { }
        }
      };
    };

    var sketch = function (f) {
      return UiSketcher.composite(TabviewSchema.name(), schema, partTypes, make, f);
    };

    return {
      sketch: sketch
    };
  }
);