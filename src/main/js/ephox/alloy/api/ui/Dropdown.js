define(
  'ephox.alloy.api.ui.Dropdown',

  [
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.spec.DropdownSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (CompositeBuilder, InternalSink, PartType, DropdownSpec, FieldSchema, Fun, Option) {
    var schema = [
      FieldSchema.strict('fetch'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      // FIX: Remove defaulted toggleClass
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('displayer', Fun.identity),
      FieldSchema.option('lazySink'),
      FieldSchema.defaulted('matchWidth', false)
    ];

    var partTypes = [
      PartType.external('menu', 
        function (detail) {
          return {
            onExecute: detail.onExecute()
          };
        },
        Fun.constant({ })
      ),
      InternalSink
    ];

    var build = function (f) {
      return CompositeBuilder.build('dropdown', schema, partTypes, DropdownSpec.make, f);
    };

    return {
      build: build
    };
  }
);