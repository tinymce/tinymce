import { Pipeline } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/mobile/Theme';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.themes.mobile.SkinFalseTest', function (success, failure) {

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {

    // This is a weird test that only checks that the skinloaded event is fired even if skin is set to false
    Pipeline.async({}, [
    ], onSuccess, onFailure);
  }, {
    skin: false,
    theme: 'mobile',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
