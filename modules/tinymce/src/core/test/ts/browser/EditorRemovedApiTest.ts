import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorApiTest', (success, failure) => {

  Theme();

  const sRemoveEditor = (editor) => {
    return Step.sync(() => {
      editor.remove();
    });
  };

  const sExecCallback = (editor, name, arg) => {
    return Step.sync(() => {
      editor.execCallback(name, arg);
    });
  };

  const sTryAccess = (editor, name, expectedValue) => {
    return Step.sync(() => {
      const result = editor[name]();
      Assertions.assertEq('Should be expected value on a removed editor', expectedValue, result);
    });
  };

  const sShow = (editor) => {
    return Step.sync(() => {
      editor.show();
    });
  };

  const sHide = (editor) => {
    return Step.sync(() => {
      editor.hide();
    });
  };

  const sLoad = (editor) => {
    return Step.sync(() => {
      editor.load();
    });
  };

  const sSave = (editor) => {
    return Step.sync(() => {
      editor.save();
    });
  };

  const sQueryCommandState = (editor, name) => {
    return Step.sync(() => {
      editor.queryCommandState(name);
    });
  };

  const sQueryCommandValue = (editor, name) => {
    return Step.sync(() => {
      editor.queryCommandValue(name);
    });
  };

  const sQueryCommandSupported = (editor, name) => {
    return Step.sync(() => {
      editor.queryCommandSupported(name);
    });
  };

  const sUploadImages = (editor) => {
    return Step.sync(() => {
      editor.uploadImages(Fun.noop);
    });
  };

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
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
        tinyApis.sFocus(),
        tinyApis.sNodeChanged(),
        sExecCallback(editor, 'test_callback', 1)
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    test_callback: Fun.noop
  }, success, failure);
});
