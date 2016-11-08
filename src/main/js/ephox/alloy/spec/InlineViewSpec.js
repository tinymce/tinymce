define(
  'ephox.alloy.spec.InlineViewSpec',

  [
    'ephox.alloy.dropdown.Gamma',
    'ephox.alloy.menu.logic.ViewTypes',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Body'
  ],

  function (Gamma, ViewTypes, SpecSchema, FieldSchema, ValueSchema, Fun, Option, Cell, Body) {
    var schema = [
      FieldSchema.strict('fetch'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.strict('dom'),
      FieldSchema.strict('lazySink'),
      FieldSchema.defaulted('matchWidth', false),
      FieldSchema.defaulted('initAnchor', {
        anchor: 'selection',
        root: Body.body()
      }),
      ViewTypes.schema()
    ];

    var make = function (spec) {
      

      var detail = SpecSchema.asStructOrDie('inline-view.spec', schema, spec, [ ]);

      // Default anchorage
      var anchorage = Cell(detail.initAnchor());

      var lazySink = detail.lazySink();

      // var interactions = {
      //   onOpen: onOpen,
      //   onClose: onClose,
      //   onExecute: detail.onExecute(),
      //   lazySink: lazySink
      // };

      // return detail.view().sandbox().spawn(hotspot, detail, interactions);

      var config = InlineConfig({
        anchorage: anchorage,
        lazySink: detail.lazySink()
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
    return null;
  }
);