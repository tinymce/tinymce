import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader } from '@ephox/mcagar';

import Env from 'tinymce/core/api/Env';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

import Paste from '../module/test/Paste';

UnitTest.asynctest('tinymce.plugins.paste.browser.PasteFormatToggleTest', (success, failure) => {
  ModernTheme();
  PastePlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const steps = Env.webkit ? [
      Logger.t('paste plain text',
        GeneralSteps.sequence([
          tinyApis.sExecCommand('mceTogglePlainTextPaste'),
          Paste.sPaste(editor, { 'text/html': '<p><strong>test</strong></p>'}),
          tinyApis.sAssertContent('<p>test</p>'),
          tinyApis.sSetContent(''),
          tinyApis.sExecCommand('mceTogglePlainTextPaste'),
          Paste.sPaste(editor, { 'text/html': '<p><strong>test</strong></p>'}),
          tinyApis.sAssertContent('<p><strong>test</strong></p>')
        ])
      )
    ] : [];

    Pipeline.async({}, steps, onSuccess, onFailure);
  }, {
    plugins: 'paste',
    toolbar: '',
    valid_styles: 'font-family,color',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
