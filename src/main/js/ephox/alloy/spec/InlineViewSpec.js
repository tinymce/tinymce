define(
  'ephox.alloy.spec.InlineViewSpec',

  [
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Body'
  ],

  function (SpecSchema, FieldSchema, Merger, Fun, Option, Cell, Body) {
    var schema = [
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.strict('dom'),
      FieldSchema.strict('lazySink'),
      FieldSchema.defaulted('matchWidth', false),
      FieldSchema.defaulted('initAnchor', {
        anchor: 'selection',
        root: Body.body()
      })
    ];

    var make = function (spec) {
      

      var detail = SpecSchema.asStructOrDie('inline-view.spec', schema, spec, [ ]);

      // Default anchorage
      var anchorage = Cell(detail.initAnchor());
      var lazyAnchor = anchorage.get;

      var lazySink = detail.lazySink();

      var interactions = {
        onOpen: Fun.noop,
        onClose: Fun.noop,
        onExecute: detail.onExecute(),
        lazySink: lazySink
      };

      return Merger.deepMerge(
        detail.view().sandbox().spawn(lazyAnchor, detail, interactions),
        {
          uid: detail.uid(),
          apis: {
            setAnchor: function (component, newAnchor) {
              anchorage.set(newAnchor);
            }
          }
        }
      );

      // return detail.view{
      //   uiType: 'custom',
      //   dom: {
      //     tag: 'div'
      //   },
      //   behaviours: [
      //     Sandboxing
      //   ],
      //   sandboxing: config.sandboxing,
      //   keying: {
      //     mode: 'cyclic'
      //   },
      //   receiving: config.receiving,
      //   // Only pass through uid if provided.
      //   uid: detail.uid().getOr(undefined),
      //   apis: config.apis
      // };
    };

    return {
      make: make
    };
  }
);