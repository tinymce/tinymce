import { GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.content.EditorContentForcedRootBlockTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('getContent empty editor depending on forced_root_block setting', GeneralSteps.sequence([
        tinyApis.sSetRawContent('<p><br></p>'),
        tinyApis.sAssertContent('<p>&nbsp;</p>'),
        tinyApis.sSetRawContent('<div><br></div>'),
        tinyApis.sAssertContent('')
      ]))
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    inline: true,
    forced_root_block: 'div'
  }, success, failure);
});
