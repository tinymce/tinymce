import { Pipeline } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import InliteTheme from 'tinymce/themes/inlite/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.themes.inlite.SkinFalseTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  InliteTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    // This is a weird test that only checks that the skinloaded event is fired even if skin is set to false
    Pipeline.async({}, [
    ], onSuccess, onFailure);
  }, {
    skin: false,
    inline: true,
    theme: 'inlite',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
