asynctest(
  'browser.tinymce.core.delete.DeleteCommandsTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.delete.DeleteCommands',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, DeleteCommands, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sDelete = function (editor) {
      return Step.sync(function () {
        DeleteCommands.deleteCommand(editor);
      });
    };

    var sForwardDelete = function (editor) {
      return Step.sync(function () {
        DeleteCommands.forwardDeleteCommand(editor);
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('Delete should merge blocks', GeneralSteps.sequence([
          tinyApis.sSetContent('<h1>a</h1><p><span style="color: red;">b</span></p>'),
          tinyApis.sSetCursor([1, 0, 0], 0),
          sDelete(editor),
          tinyApis.sAssertContent('<h1>a<span style="color: red;">b</span></h1>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('ForwardDelete should merge blocks', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><span style="color: red;">a</span></p><h1>b</h1>'),
          tinyApis.sSetCursor([0, 0, 0], 1),
          sForwardDelete(editor),
          tinyApis.sAssertContent('<p><span style="color: red;">a</span>b</p>'),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      indent: false
    }, success, failure);
  }
);