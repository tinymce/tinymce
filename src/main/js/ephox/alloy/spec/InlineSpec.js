define(
  'ephox.alloy.spec.InlineSpec',

  [
    'ephox.alloy.inline.spi.InlineConfig',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Body'
  ],

  function (InlineConfig, FieldSchema, ValueSchema, Merger, Cell, Body) {


    var make = function (spec) {
      // Put inside in case Body.body isn't ready
      var schema = ValueSchema.objOf([
        FieldSchema.strict('lazySink'),
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
        lazySink: detail.lazySink()
      });

      return Merger.deepMerge(
        spec, 
        {
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
        }
      );
    };

    return {
      make: make
    };
  }
);