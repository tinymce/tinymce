import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import * as RemoveFormat from 'tinymce/core/fmt/RemoveFormat';
import SilverTheme from 'tinymce/themes/silver/Theme';

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
      tinyApis.sFocus(),
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
          tinyApis.sAssertContent('<p>ab <strong>cd</strong></p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('In middle of last of two words wrapped in strong', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>ab cd</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 4),
          sRemoveFormat(editor, removeFormat),
          tinyApis.sAssertContent('<p><strong>ab</strong> cd</p>'),
          tinyApis.sAssertSelection([0, 1], 2, [0, 1], 2)
        ])),
        Logger.t('In middle of first of two words wrapped in strong, with the first wrapped in em as well', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong><em>ab</em> cd</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0, 0], 1),
          sRemoveFormat(editor, removeFormat),
          tinyApis.sAssertContent('<p>ab <strong>cd</strong></p>'),
          tinyApis.sAssertSelection([0, 0], 1, [0, 0], 1)
        ])),
        Logger.t('After first of two words, with multiple spaces wrapped in strong', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>ab&nbsp; &nbsp;cd</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 2),
          sRemoveFormat(editor, removeFormat),
          tinyApis.sAssertContent('<p>ab&nbsp; &nbsp;<strong>cd</strong></p>'),
          tinyApis.sAssertSelection([0, 0], 2, [0, 0], 2)
        ])),
        Logger.t('Before last of two words, with multiple spaces wrapped in strong', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><strong>ab&nbsp; &nbsp;cd</strong></p>'),
          tinyApis.sSetCursor([0, 0, 0], 5),
          sRemoveFormat(editor, removeFormat),
          tinyApis.sAssertContent('<p><strong>ab</strong>&nbsp; &nbsp;cd</p>'),
          tinyApis.sAssertSelection([0, 1], 3, [0, 1], 3)
        ])),
      ])),
      Logger.t('Remove single format with collapsed selection', GeneralSteps.sequence([
        Logger.t('In middle of first of two words wrapped in strong and em', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><em><strong>ab cd</strong></em></p>'),
          tinyApis.sSetCursor([0, 0, 0, 0], 1),
          sRemoveFormat(editor, boldFormat),
          tinyApis.sAssertContent('<p><em>ab <strong>cd</strong></em></p>'),
          tinyApis.sAssertSelection([0, 0, 0], 1, [0, 0, 0], 1)
        ])),
        Logger.t('After first of two words, with multiple spaces wrapped in strong and em', GeneralSteps.sequence([
          tinyApis.sSetContent('<p><em><strong>ab&nbsp; &nbsp;cd</strong></em></p>'),
          tinyApis.sSetCursor([0, 0, 0, 0], 2),
          sRemoveFormat(editor, boldFormat),
          tinyApis.sAssertContent('<p><em>ab&nbsp; &nbsp;<strong>cd</strong></em></p>'),
          tinyApis.sAssertSelection([0, 0, 0], 2, [0, 0, 0], 2)
        ])),
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    plugins: '',
    toolbar: '',
  }, success, failure);
});
