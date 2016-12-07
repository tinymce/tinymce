define(
  'ephox.alloy.api.ui.Typeahead',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.spec.TypeaheadSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell'
  ],

  function (CompositeBuilder, InternalSink, PartType, TypeaheadSpec, FieldSchema, Fun, Option, Cell) {
    var schema = [
      FieldSchema.strict('lazySink'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('dom'),
      FieldSchema.option('lazySink'),
      FieldSchema.defaulted('minChars', 5),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.defaulted('matchWidth', true),
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
      FieldSchema.state('previewing', function () {
        return Cell(true);
      })
    ];

    var partTypes = [
      PartType.external('menu'),
      InternalSink
    ];

    var build = function (f) {
      return CompositeBuilder.build('dropdown', schema, partTypes, TypeaheadSpec.make, f);
    };

    return {
      build: build
    };
  }
);