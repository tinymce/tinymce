import { Pipeline } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.themes.modern.SkinFalseInlineTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    // This is a weird test that only checks that the skinloaded event is fired even if skin is set to false
    Pipeline.async({}, [
    ], onSuccess, onFailure);
  }, {
    skin: false,
    inline: true,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
