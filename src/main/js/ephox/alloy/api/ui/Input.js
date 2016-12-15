define(
  'ephox.alloy.api.ui.Input',

  [
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.ui.common.InputBase',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun'
  ],

  function (UiBuilder, InputBase, FieldSchema, Merger, Fun) {
    var schema = [
      FieldSchema.option('data'),
      FieldSchema.defaulted('type', 'input'),
      FieldSchema.defaulted('tag', 'input')
    ];

    var build = function (spec) {
      return UiBuilder.single('Input', schema, make, spec);
    };

    var make = function (detail, spec) {
      return Merger.deepMerge(spec, {
        uid: detail.uid(),
        uiType: 'custom',
        dom: InputBase.dom(detail),
        // No children.
        components: [ ],
        behaviours: InputBase.behaviours(detail)
      });
    };

    return {
      build: build,
      name: Fun.constant('input')
    };
  }
);