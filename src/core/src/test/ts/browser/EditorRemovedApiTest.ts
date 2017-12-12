import { Assertions } from '@ephox/agar';
import { GeneralSteps } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { TinyApis } from '@ephox/mcagar';
import { TinyLoader } from '@ephox/mcagar';
import ViewBlock from '../module/test/ViewBlock';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.core.EditorApiTest', function() {
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
});

