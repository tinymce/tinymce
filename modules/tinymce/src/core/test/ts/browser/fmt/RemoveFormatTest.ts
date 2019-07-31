import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import SilverTheme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import RemoveFormat from 'tinymce/core/fmt/RemoveFormat';

UnitTest.asynctest('browser.tinymce.core.fmt.RemoveFormatTest', (success, failure) => {
  SilverTheme();

  const sRemoveFormat = function (editor, format) {
    return Step.sync(function () {
      editor.formatter.register('format', format);
      RemoveFormat.remove(editor, 'format');
      editor.formatter.unregister('format');
    });
  };

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const removeFormat = [{
      selector: 'strong, em',
      remove: 'all',
      split: true,
      expand: false
    }];
    const boldFormat = [{
      inline: 'strong',
      remove: 'all'
    }];

    Pipeline.async({}, [
      tinyApis.sFocus,
      Logger.t('Remove format with collapsed selection', GeneralSteps.sequence([
        Logger.t('In middle of single word wrapped in strong', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>ab</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 1),
          sRemoveFormat(editor, removeFormat),
          tinyApis.sAssertContent('<p>ab</p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('In middle of first of two words wrapped in strong', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>ab cd</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 1),
          sRemoveFormat(editor, removeFormat),
          tinyApis.sAssertContent('<p>ab<strong> cd</strong></p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('In middle of last of two words wrapped in strong', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>ab cd</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 4),
          sRemoveFormat(editor, removeFormat),
          tinyApis.sAssertContent('<p><strong>ab</strong> cd</p>'),
          tinyApis.sAssertSelection([0, 1], 2, [0, 1], 2)
        ])),
        Logger.t('In middle of first of two words wrapped in strong, with the first wrapped in em aswell', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong><em>ab</em> cd</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0, 0], 1),
          sRemoveFormat(editor, removeFormat),
          tinyApis.sAssertContent('<p>ab<strong> cd</strong></p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
      ])),
      Logger.t('Remove single format with collapsed selection', GeneralSteps.sequence([
        Logger.t('In middle of first of two words wrapped in strong and em', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><em><strong>ab cd</strong></em></p>'),
          tinyApis.sSetCursor([0, 0, 0, 0], 1),
          sRemoveFormat(editor, boldFormat),
          tinyApis.sAssertContent('<p><em>ab<strong> cd</strong></em></p>'),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ])),
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    plugins: '',
    toolbar: '',
  }, success, failure);
});
