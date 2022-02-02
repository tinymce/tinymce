import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/wrap-mcagar';

import Theme from 'tinymce/themes/mobile/Theme';

UnitTest.asynctest('browser.tinymce.themes.mobile.SkinFalseTest', (success, failure) => {

  Theme();

  TinyLoader.setup((editor, onSuccess, onFailure) => {

    // This is a weird test that only checks that the skinloaded event is fired even if skin is set to false
    Pipeline.async({}, [
    ], onSuccess, onFailure);
  }, {
    skin: false,
    theme: 'mobile',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
