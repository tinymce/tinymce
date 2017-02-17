asynctest(
  'browser.tinymce.core.utils.quirks.DeleteAllWebkitTest',
  [
    'ephox.agar.api.Chain',
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
    Chain, Keyboard, Keys, Pipeline, Step, TinyApis, TinyDom, TinyLoader, Env, Plugin,
    Theme
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

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var apis = TinyApis(editor);
      var steps = Env.webkit ? [
        sRawSetContent(editor, '<p>a</p><p><br /></p><p><br /></p><p>b</p>'),
        apis.sSetSelection([2], 0, [3, 0], 1),
        sKeydown(TinyDom.fromDom(editor.getBody()), Keys.backspace()),
        apis.sAssertContent('<p>a</p><p>&nbsp;</p><p>&nbsp;</p>')
      ] : [];

      Pipeline.async({}, steps, onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      indent: false,
      height: 500
    }, success, failure);
  }
);
