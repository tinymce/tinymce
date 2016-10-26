define(
  'ephox.alloy.menu.layered.LayeredSandbox',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.menu.layered.LayeredConfig',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.perhaps.Option'
  ],

  function (ComponentStructure, LayeredConfig, MenuMarkers, Dismissal, SpecSchema, FieldPresence, FieldSchema, ValueSchema, Option) {
    var schema = [
      // This hotspot is going to have to be a little more advanced when we get away from menus and dropdowns
      FieldSchema.strict('lazyHotspot'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onOpen'),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.option('focusClass'),
      FieldSchema.strict('sink'),
      FieldSchema.defaulted('itemValue', 'data-item-value'),
      FieldSchema.defaulted('backgroundClass', 'background-menu'),
      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.schema()
      ),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('menu'),
          FieldSchema.strict('item')
        ])
      )
    ];

    var make = function (spec) {
      // Not ideal that it's raw.
      var detail = SpecSchema.asRawOrDie('layered.sandbox', schema, spec, [ ]);

      var config = LayeredConfig({
        lazyHotspot: detail.lazyHotspot,
        onClose: detail.onClose,
        onOpen: detail.onOpen,
        onExecute: detail.onExecute,
        sink: detail.sink,
        itemValue: detail.itemValue,
        backgroundClass: detail.backgroundClass,
        markers: detail.markers,
        members: detail.members,
        focusClass: detail.focusClass.getOr(undefined)
      });

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
        events: config.events,
        highlighting: {
          highlightClass: detail.markers.selectedMenu,
          itemClass: detail.markers.menu
        }
      };
    };

    return {
      make: make
    };
  }
);