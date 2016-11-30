define(
  'ephox.alloy.menu.layered.LayeredSandbox',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.data.Fields',
    'ephox.alloy.menu.layered.LayeredConfig',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (ComponentStructure, Fields, LayeredConfig, MenuMarkers, Dismissal, SpecSchema, FieldPresence, FieldSchema, ValueSchema, Fun, Option) {
    var schema = [
      // This hotspot is going to have to be a little more advanced when we get away from menus and dropdowns
      FieldSchema.strict('lazyAnchor'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onOpen'),

      FieldSchema.strict('scaffold'),

      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.defaulted('fakeFocus', false),
      FieldSchema.strict('lazySink'),
      FieldSchema.defaulted('itemValue', 'data-item-value'),
      FieldSchema.defaulted('backgroundClass', 'background-menu'),
      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.schema()
      ),

      Fields.members([ 'menu', 'item' ]),

      FieldSchema.strict('onHighlight')
    ];

    var make = function (spec) {
      // Not ideal that it's raw.
      var detail = SpecSchema.asRawOrDie('layered.sandbox', schema, spec, [ ]);

      var config = LayeredConfig(detail);

      var isExtraPart = function (sandbox, target) {
        return  ComponentStructure.isPartOfAnchor(detail.lazyAnchor(), target);
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