define(
  'ephox.alloy.menu.layered.LayeredSandbox',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Arr',
    'ephox.peanut.Fun'
  ],

  function (ComponentStructure, Sandboxing, Dismissal, SpecSchema, FieldSchema, Arr, Fun) {
    var schema = [
      // This hotspot is going to have to be a little more advanced when we get away from menus and dropdowns
      FieldSchema.strict('lazyAnchor'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onOpen'),

      FieldSchema.strict('lazySink')
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('layered.sandbox', schema, spec, [ ]);

      var isExtraPart = function (sandbox, target) {
        return  ComponentStructure.isPartOfAnchor(detail.lazyAnchor(), target);
      };

      return {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        behaviours: {
          sandboxing: {
            onOpen: detail.onOpen(),
            onClose: detail.onClose(),
            isPartOf: function (container, data, queryElem) {
              return ComponentStructure.isPartOf(data, queryElem);
            },
            bucket: {
              mode: 'sink',
              lazySink: detail.lazySink()
            }
          },
          receiving: Dismissal.receiving({
            isExtraPart: isExtraPart
          })
        },
        events: { }
      };
    };

    return {
      make: make
    };
  }
);