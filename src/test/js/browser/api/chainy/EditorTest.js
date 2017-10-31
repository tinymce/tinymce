asynctest(
  'SelectionTest',

  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Assertions',
    'ephox.mcagar.api.chainy.Api',
    'ephox.mcagar.api.chainy.Editor'
  ],

  function (Pipeline, Chain, Assertions, Api, Editor) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var cAssertEditorExists = Chain.op(function (editor) {
      Assertions.assertEq("asserting that editor is truthy", true, !!editor);
    });

    Pipeline.async({}, [
      Chain.asStep({}, [
        Editor.cCreateInline,
        Api.cFocus,
        cAssertEditorExists,
        Editor.cRemove
      ])
    ], function () {
      success();
    }, failure);
  }
);