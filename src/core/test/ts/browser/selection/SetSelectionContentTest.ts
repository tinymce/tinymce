import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import SetSelectionContent from 'tinymce/core/selection/SetSelectionContent';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.selection.SetSelectionContentTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  const sSetContent = function (editor, content, args) {
    return Step.sync(function () {
      SetSelectionContent.setContent(editor, content, args);
    });
  };

  const sSetContentOverride = function (editor, content, overrideContent, args) {
    return Step.sync(function () {
      const handler = function (e) {
        if (e.selection === true) {
          e.preventDefault();
          editor.getBody().innerHTML = overrideContent;
        }
      };

      editor.on('BeforeSetContent', handler);
      SetSelectionContent.setContent(editor, content, args);
      editor.off('BeforeSetContent', handler);
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Should insert a before b', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>b</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
        sSetContent(editor, 'a', {}),
        tinyApis.sAssertContent('<p>ab</p>')
      ])),
      Logger.t('Should fill the body with x h1 instead of a before b in a paragraph', GeneralSteps.sequence([
        tinyApis.sSetContent('<p>b</p>'),
        tinyApis.sSetSelection([0, 0], 0, [0, 0], 0),
        sSetContentOverride(editor, 'a', '<h1>x</h1>', {}),
        tinyApis.sAssertContent('<h1>x</h1>')
      ]))
    ], onSuccess, onFailure);
  }, {
    selector: 'textarea',
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
