define(
  'ephox.alloy.spec.MenuSandboxSpec',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.menu.spi.MenuConfig',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.perhaps.Option'
  ],

  function (ComponentStructure, MenuConfig, MenuMarkers, Dismissal, FieldPresence, FieldSchema, ValueSchema, Option) {
    var schema = ValueSchema.objOf([
      // This hotspot is going to have to be a little more advanced when we get away from menus and dropdowns
      FieldSchema.strict('lazyHotspot'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onOpen'),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.strict('sink'),
      FieldSchema.defaulted('itemValue', 'data-item-value'),
      FieldSchema.defaulted('backgroundClass', 'background-menu'),
      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.defaulted(MenuMarkers.fallback()),
        MenuMarkers.schema()
      )
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asRawOrDie('menusandbox.spec', schema, spec);

      var config = MenuConfig(detail);

      var isExtraPart = function (sandbox, target) {
        return ComponentStructure.isPartOf(detail.lazyHotspot(), target);
      };

      return {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        sandboxing: config.sandboxing,
        // Temporary
        uid: 'magic',
        keying: config.keying,
        receiving: Dismissal.receiving({
          isExtraPart: isExtraPart
        }),
        events: config.events,
        highlighting: {
          highlightClass: 'active-menu',
          itemClass: 'lab-menu'
        }
      };
    };

    return {
      make: make
    };
  }
);