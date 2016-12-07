define(
  'ephox.alloy.api.ui.SplitDropdown',

  [
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.SplitDropdownSpec',
    'ephox.boulder.api.FieldSchema',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (Tagger, SpecSchema, SplitDropdownSpec, FieldSchema, Obj, Merger, Fun) {
    var schema = [
      FieldSchema.strict('toggleClass'),
      FieldSchema.strict('fetch'),
      FieldSchema.strict('onExecute'),
      FieldSchema.option('lazySink'),
      FieldSchema.strict('dom'),
      FieldSchema.defaulted('onOpen', Fun.noop),
      // FieldSchema.defaulted('onClose', Fun.noop),

      FieldSchema.defaulted('matchWidth', false)
    ];

    var build = function (f) {


      var parts = {
        arrow: Fun.constant({
          placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.arrow>' }),
          build: function (spec) {
            return spec;
          }
        }),
        button: Fun.constant({
          placeholder: Fun.constant({ uiType: 'placeholder', owner: 'split-dropdown', name: '<alloy.split-dropdown.button>' }),
          build: function (spec) {
            return spec;
          }
        }),
        menu: Fun.constant({
          placeholder: Fun.die('The part menu should not appear in components'),
          build: function (spec) {
            return spec;
          }
        })
      };

      var spec = f(parts);
      var userSpec = Merger.deepMerge({
        uid: Tagger.generate('uid')
      }, spec);


      var detail = SpecSchema.asStructOrDie('split-dropdown.build', schema, userSpec, Obj.keys(parts));

      return SplitDropdownSpec.make(detail);
    };

    return {
      build: build
    };
  }
);