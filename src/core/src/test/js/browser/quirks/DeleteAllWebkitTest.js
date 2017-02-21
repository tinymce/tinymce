asynctest(
  'browser.tinymce.core.utils.quirks.DeleteAllWebkitTest',
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyDom',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.Env',
    'tinymce.plugins.media.Plugin',
    'tinymce.themes.modern.Theme'
  ],
  function (
    Chain, GeneralSteps, Keyboard, Keys, Pipeline, Step, TinyApis, TinyDom, TinyLoader,
    Env, Plugin, Theme
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Plugin();
    Theme();

    var sRawSetContent = function (editor, content) {
      return Step.sync(function () {
        editor.getBody().innerHTML = content;
      });
    };

    var sKeydown = function (doc, keyvalue) {
      return Step.sync(function () {
        Keyboard.keydown(keyvalue, {}, doc);
      });
    };

    var sAssertDeletion = function (editor, apis, content, selectionPath, expected) {
      return GeneralSteps.sequence([
        sRawSetContent(editor, content),
        apis.sSetSelection.apply(null, selectionPath),
        sKeydown(TinyDom.fromDom(editor.getBody()), Keys.backspace()),
        apis.sAssertContent(expected)
      ]);
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var apis = TinyApis(editor);
      var steps = Env.webkit ? [
        sAssertDeletion(
          editor, apis,
          '<p>a</p><p><br /></p><p><br /></p><p>b</p>',
          [[2], 0, [3, 0], 1],
          '<p>a</p><p>&nbsp;</p><p>&nbsp;</p>'
        ),
        apis.sSetContent(''),
        sAssertDeletion(
          editor, apis,
          '<p>a</p><p><br /></p><p><br /></p><p>b</p>',
          [[0], 0, [2, 0], 0],
          '<p>&nbsp;</p><p>b</p>'
        ),
        sAssertDeletion(
          editor, apis,
          '<p>a</p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p><br /></p><p>b</p>',
          [[1], 0, [6], 0],
          '<p>a</p><p>b</p>'
        )
      ] : [];

      Pipeline.async({}, steps, onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      indent: false,
      height: 500
    }, success, failure);
  }
);
