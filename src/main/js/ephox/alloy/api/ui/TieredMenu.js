define(
  'ephox.alloy.api.ui.TieredMenu',

  [
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.ui.schema.TieredMenuSchema',
    'ephox.alloy.ui.single.TieredMenuSpec',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Merger'
  ],

  function (GuiTypes, UiSketcher, TieredMenuSchema, TieredMenuSpec, Objects, Merger) {
    var schema = TieredMenuSchema.schema();

    var sketch = function (spec) {
      return UiSketcher.single(TieredMenuSchema.name(), schema, TieredMenuSpec.make, spec);
    };

    var simpleData = function (name, label, items) {
      return {
        primary: name,
        menus: Objects.wrap(
          name,
          {
            value: name,
            text: label,
            items: items
          }
        ),
        expansions: { }
      };
    };

    var tieredData = function (primary, menus, expansions) {
      return {
        primary: primary,
        menus: menus,
        expansions: expansions
      };
    };

    var singleData = function (name, label, item) {
      return {
        primary: name,
        menus: Objects.wrap(name, {
          value: name,
          text: label,
          items: [ item ]
        }),
        expansions: { }
      };
    };

    return Merger.deepMerge(
      {
        sketch: sketch,
        simpleData: simpleData,
        tieredData: tieredData,
        singleData: singleData
      },

      GuiTypes.makeApis([ 'getSelectedItem' ])
    );
  }
);