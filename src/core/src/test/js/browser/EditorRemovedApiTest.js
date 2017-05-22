asynctest(
  'browser.tinymce.core.EditorApiTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.mcagar.api.TinyApis',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.test.ViewBlock',
    'tinymce.themes.modern.Theme'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, TinyApis, TinyLoader, ViewBlock, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    Theme();

    var sRemoveEditor = function (editor) {
      return Step.sync(function () {
        editor.remove();
      });
    };

    var sExecCallback = function (editor, name, arg) {
      return Step.sync(function () {
        editor.execCallback(name, arg);
      });
    };

    var sTryAccess = function (editor, name, expectedValue) {
      return Step.sync(function () {
        var result = editor[name]();
        Assertions.assertEq('Should be expected value on a removed editor', expectedValue, result);
      });
    };

    var sShow = function (editor) {
      return Step.sync(function () {
        editor.show();
      });
    };

    var sHide = function (editor) {
      return Step.sync(function () {
        editor.hide();
      });
    };

    var sLoad = function (editor) {
      return Step.sync(function () {
        editor.load();
      });
    };

    var sSave = function (editor) {
      return Step.sync(function () {
        editor.save();
      });
    };

    var sQueryCommandState = function (editor, name) {
      return Step.sync(function () {
        editor.queryCommandState(name);
      });
    };

    var sQueryCommandValue = function (editor, name) {
      return Step.sync(function () {
        editor.queryCommandValue(name);
      });
    };

    var sQueryCommandSupported = function (editor, name) {
      return Step.sync(function () {
        editor.queryCommandSupported(name);
      });
    };

    var sUploadImages = function (editor) {
      return Step.sync(function () {
        editor.uploadImages(function () {
        });
      });
    };

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      var tinyApis = TinyApis(editor);

      Pipeline.async({}, [
        sRemoveEditor(editor),
        Logger.t('Try to access/execute things on an editor that does not exists', GeneralSteps.sequence([
          sTryAccess(editor, 'getBody', null),
          sTryAccess(editor, 'getDoc', null),
          sTryAccess(editor, 'getWin', null),
          sTryAccess(editor, 'getContent', ''),
          sTryAccess(editor, 'getContainer', null),
          sTryAccess(editor, 'getContentAreaContainer', null),
          sLoad(editor),
          sSave(editor),
          sShow(editor),
          sHide(editor),
          sQueryCommandState(editor, 'bold'),
          sQueryCommandValue(editor, 'bold'),
          sQueryCommandSupported(editor, 'bold'),
          sUploadImages(editor),
          tinyApis.sSetContent('a'),
          tinyApis.sExecCommand('bold'),
          tinyApis.sFocus,
          tinyApis.sNodeChanged,
          sExecCallback(editor, 'test_callback', 1)
        ]))
      ], onSuccess, onFailure);
    }, {
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      test_callback: function () {
      }
    }, success, failure);
  }
);
