import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.EditorApiTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sRemoveEditor = function (editor) {
    return Step.sync(function () {
      editor.remove();
    });
  };

  const sExecCallback = function (editor, name, arg) {
    return Step.sync(function () {
      editor.execCallback(name, arg);
    });
  };

  const sTryAccess = function (editor, name, expectedValue) {
    return Step.sync(function () {
      const result = editor[name]();
      Assertions.assertEq('Should be expected value on a removed editor', expectedValue, result);
    });
  };

  const sShow = function (editor) {
    return Step.sync(function () {
      editor.show();
    });
  };

  const sHide = function (editor) {
    return Step.sync(function () {
      editor.hide();
    });
  };

  const sLoad = function (editor) {
    return Step.sync(function () {
      editor.load();
    });
  };

  const sSave = function (editor) {
    return Step.sync(function () {
      editor.save();
    });
  };

  const sQueryCommandState = function (editor, name) {
    return Step.sync(function () {
      editor.queryCommandState(name);
    });
  };

  const sQueryCommandValue = function (editor, name) {
    return Step.sync(function () {
      editor.queryCommandValue(name);
    });
  };

  const sQueryCommandSupported = function (editor, name) {
    return Step.sync(function () {
      editor.queryCommandSupported(name);
    });
  };

  const sUploadImages = function (editor) {
    return Step.sync(function () {
      editor.uploadImages(function () {
      });
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

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
    base_url: '/project/tinymce/js/tinymce',
    test_callback () {
    }
  }, success, failure);
});
