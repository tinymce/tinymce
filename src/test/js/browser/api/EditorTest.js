asynctest(
  'SelectionTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Assertions',
    'ephox.mcagar.api.ApiChains',
    'ephox.mcagar.api.Editor'
  ],

  function (Pipeline, Chain, Assertions, ApiChains, Editor) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var cAssertEditorExists = Chain.op(function (editor) {
      Assertions.assertEq("asserting that editor is truthy", true, !!editor);
    });

    Pipeline.async({}, [
      Chain.asStep({}, [
        Editor.cCreateInline,
        ApiChains.cFocus,
        cAssertEditorExists,
        Editor.cRemove
      ])
    ], function () {
      success();
    }, failure);
  }
);