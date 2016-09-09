define(
  'ephox.alloy.spec.InlineSpec',

  [
    'ephox.alloy.behaviour.Sandboxing',
    'ephox.alloy.inline.spi.InlineConfig',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Body'
  ],

  function (Sandboxing, InlineConfig, FieldSchema, ValueSchema, Cell, Body) {


    var make = function (spec) {
      // Put inside in case Body.body isn't ready
      var schema = ValueSchema.objOf([
        FieldSchema.strict('sink'),
        FieldSchema.defaulted('anchor', {
          anchor: 'selection',
          root: Body.body()
        }),
        FieldSchema.option('uid')
      ]);

      var detail = ValueSchema.asStructOrDie('inline.spec', schema, spec);

      // Default anchorage
      var anchorage = Cell(detail.anchor());

      var config = InlineConfig({
        anchorage: anchorage,
        sink: detail.sink()
      });

      return {
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        behaviours: [
          Sandboxing
        ],
        sandboxing: config.sandboxing,
        keying: {
          mode: 'cyclic'
        },
        receiving: config.receiving,
        // Only pass through uid if provided.
        uid: detail.uid().getOr(undefined),
        apis: config.apis
      };
    };

    return {
      make: make
    };
  }
);