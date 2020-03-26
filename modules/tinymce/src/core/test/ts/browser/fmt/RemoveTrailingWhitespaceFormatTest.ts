import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.fmt.RemoveTrailingWhitespaceFormatTest', (success, failure) => {

  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const boldSelector = 'button[aria-label="Bold"]';

    Pipeline.async({}, [
      tinyApis.sFocus(),
      Logger.t('remove bold with leading whitespace', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><strong>a b</strong></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3),
        tinyUi.sClickOnToolbar('toggle off bold', boldSelector),
        tinyApis.sAssertContent('<p><strong>a</strong> b</p>')
      ])),
      Logger.t('remove bold with trailing whitespace', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><strong>a b</strong></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2),
        tinyUi.sClickOnToolbar('toggle off bold', boldSelector),
        tinyApis.sAssertContent('<p>a <strong>b</strong></p>')
      ])),
      Logger.t('unlink with leading whitespace', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><a href="#">a b</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 3),
        tinyApis.sExecCommand('unlink'),
        tinyApis.sAssertContent('<p><a href="#">a</a> b</p>')
      ])),
      Logger.t('unlink with trailing whitespace', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><a href="#">a b</a></p>'),
        tinyApis.sSetSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2),
        tinyApis.sExecCommand('unlink'),
        tinyApis.sAssertContent('<p>a <a href="#">b</a></p>')
      ]))
    ], onSuccess, onFailure);
  }, {
    toolbar: 'bold',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
}
);
