import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest(
  'browser.tinymce.core.fmt.RemoveTrailingWhitespaceFormatTest',
  function () {
    const success = arguments[arguments.length - 2];
    const failure = arguments[arguments.length - 1];

    ModernTheme();
    LinkPlugin();

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      const tinyApis = TinyApis(editor);
      const tinyUi = TinyUi(editor);

      Pipeline.async({}, [
        tinyApis.sFocus,
        Logger.t('remove bold with leading whitespace', GeneralSteps.sequence([
          tinyApis.sSetRawContent('<p><strong>a b</strong></p>'),
          tinyApis.sSetSelection([0, 0, 0], 1, [0, 0, 0], 3),
          tinyUi.sClickOnToolbar('toggle off bold', 'div[aria-label="Bold"] button'),
          tinyApis.sAssertContent('<p><strong>a</strong> b</p>')
        ])),
        Logger.t('remove bold with trailing whitespace', GeneralSteps.sequence([
          tinyApis.sSetRawContent('<p><strong>a b</strong></p>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 2),
          tinyUi.sClickOnToolbar('toggle off bold', 'div[aria-label="Bold"] button'),
          tinyApis.sAssertContent('<p>a <strong>b</strong></p>')
        ])),
        Logger.t('unlink with leading whitespace', GeneralSteps.sequence([
          tinyApis.sSetRawContent('<p><a href="#">a b</a></p>'),
          tinyApis.sSetSelection([0, 0, 0], 1, [0, 0, 0], 3),
          tinyUi.sClickOnToolbar('click unlink', 'div[aria-label="Remove link"]'),
          tinyApis.sAssertContent('<p><a href="#">a</a> b</p>')
        ])),
        Logger.t('unlink with trailing whitespace', GeneralSteps.sequence([
          tinyApis.sSetRawContent('<p><a href="#">a b</a></p>'),
          tinyApis.sSetSelection([0, 0, 0], 0, [0, 0, 0], 2),
          tinyUi.sClickOnToolbar('click unlink', 'div[aria-label="Remove link"]'),
          tinyApis.sAssertContent('<p>a <a href="#">b</a></p>')
        ]))
      ], onSuccess, onFailure);
    }, {
      plugins: 'link',
      toolbar: 'bold unlink',
      skin_url: '/project/js/tinymce/skins/lightgray'
    }, success, failure);
  }
);