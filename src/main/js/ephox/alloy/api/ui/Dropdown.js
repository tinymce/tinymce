define(
  'ephox.alloy.api.ui.Dropdown',

  [
    'ephox.alloy.spec.DropdownSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option'
  ],

  function (DropdownSpec, FieldSchema, Fun, Option) {
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
      var placeholders = {
        arrow: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.arrow>' }),
        button: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.button>' })
      };

      var spec = f(placeholders);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);


      var detail = SpecSchema.asStructOrDie('dropdown.build', schema, userSpec, [
        'button',
        'arrow',
        'menu'
      ]);

      return DropdownSpec.make(detail);
    };

    return {
      build: build
    };
  }
);