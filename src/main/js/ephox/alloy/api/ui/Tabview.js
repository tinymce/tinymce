define(
  'ephox.alloy.api.ui.Tabview',

  [
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.schema.TabviewSchema',
    'ephox.katamari.api.Merger'
  ],

  function (UiSketcher, TabviewSchema, Merger) {
    var schema = TabviewSchema.schema();
    var partTypes = TabviewSchema.parts();

    var make = function (detail, components, spec, externals) {
      return {
        uid: detail.uid(),
        dom: Merger.deepMerge(
          {
            tag: 'div',
            attributes: {
              role: 'tabpanel'
            }
          },
          detail.dom()
        ),

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