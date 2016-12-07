define(
  'ephox.alloy.api.ui.Dropdown',

  [
    'ephox.alloy.parts.InternalSink',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.DropdownSpec',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (InternalSink, Tagger, DropdownSpec, SpecSchema, UiSubstitutes, FieldSchema, Merger, Fun, Option) {
    var schema = [
      FieldSchema.strict('fetch'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.defaulted('toggleClass', 'alloy-selected-button'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('displayer', Fun.identity),
      FieldSchema.option('lazySink'),
      FieldSchema.defaulted('matchWidth', false)
    ];

    var build = function (f) {
      var parts = {
        menu: Fun.constant({
          placeholder: Fun.die('The part menu should not appear in components'),
          build: function (spec) {
            return spec;
          }
        }),

        sink: Fun.constant(InternalSink)
      };

      var spec = f(parts);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);

      var detail = SpecSchema.asStructOrDie('dropdown.build', schema, userSpec, [ 'menu' ], [ 'sink' ]);

      var components = UiSubstitutes.substitutePlaces(Option.some('split-dropdown'), detail, detail.components(), {
        '<alloy.sink>': detail.parts().sink()
      });

      return DropdownSpec.make(detail, components);
    };

    return {
      build: build
    };
  }
);