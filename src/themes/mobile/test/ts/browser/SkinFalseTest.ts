import { Pipeline } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/mobile/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.themes.mobile.SkinFalseTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {

    // This is a weird test that only checks that the skinloaded event is fired even if skin is set to false
    Pipeline.async({}, [
    ], onSuccess, onFailure);
  }, {
    skin: false,
    theme: 'mobile',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
