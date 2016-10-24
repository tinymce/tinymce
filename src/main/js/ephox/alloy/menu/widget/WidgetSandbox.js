define(
  'ephox.alloy.menu.widget.WidgetSandbox',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.menu.logic.HotspotViews',
    'ephox.alloy.menu.widget.WidgetConfig',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.perhaps.Option'
  ],

  function (ComponentStructure, HotspotViews, WidgetConfig, Dismissal, SpecSchema, FieldPresence, FieldSchema, ValueSchema, Option) {
    var schema = [
      // This hotspot is going to have to be a little more advanced when we get away from menus and dropdowns
      FieldSchema.strict('lazyHotspot'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onOpen'),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.strict('sink'),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('container')
        ])
      )
    ];

    var make = function (spec) {
      // Not ideal that it's raw.
      var detail = SpecSchema.asRawOrDie('widget.sandbox.spec', schema, spec);

      var config = WidgetConfig(detail);

      var isExtraPart = function (sandbox, target) {
        return ComponentStructure.isPartOf(detail.lazyHotspot(), target);
      };

      return {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        sandboxing: config.sandboxing,
        receiving: Dismissal.receiving({
          isExtraPart: isExtraPart
        }),
        events: { },
        keying: {
          mode: 'special',
          onTab: function () { return Option.some(true); },
          onEscape: function (sandbox) {
            return HotspotViews.onEscape(detail.lazyHotspot(), sandbox);
          }
        }
      };
    };

    return {
      make: make
    };
  }
);