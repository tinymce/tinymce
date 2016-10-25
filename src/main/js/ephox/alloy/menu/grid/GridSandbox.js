define(
  'ephox.alloy.menu.grid.GridSandbox',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.menu.grid.GridConfig',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.perhaps.Option'
  ],

  function (ComponentStructure, GridConfig, MenuMarkers, Dismissal, SpecSchema, FieldPresence, FieldSchema, ValueSchema, Option) {
    var schema = [
      // This hotspot is going to have to be a little more advanced when we get away from menus and dropdowns
      FieldSchema.strict('lazyHotspot'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onOpen'),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.strict('sink'),
      FieldSchema.defaulted('itemValue', 'data-item-value'),
      FieldSchema.defaulted('backgroundClass', 'background-menu'),
      FieldSchema.strict('flat'),
      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.itemSchema()
      ),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('grid'),
          FieldSchema.strict('item')
        ])
      )
    ];

    var make = function (spec) {
      // Not ideal that it's raw.
      var detail = SpecSchema.asRawOrDie('grid.sandbox.spec', schema, spec, [ ]);

      var config = GridConfig(detail);

      var isExtraPart = function (sandbox, target) {
        return ComponentStructure.isPartOf(detail.lazyHotspot(), target);
      };

      return {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        sandboxing: config.sandboxing,
        keying: config.keying,
        receiving: Dismissal.receiving({
          isExtraPart: isExtraPart
        }),
        events: config.events
      };
    };

    return {
      make: make
    };
  }
);