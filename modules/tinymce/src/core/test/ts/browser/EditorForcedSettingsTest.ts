import { Assertions, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorForcedSettingsTest', function (success, failure) {

  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Assertions.sAssertEq('Validate should always be true', true, editor.settings.validate),
      Assertions.sAssertEq('Validate should true since inline was set to true', true, editor.inline)
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',

    // Setting exposed as another forced setting
    inline: true,

    // Settings that are to be forced
    validate: false
  }, success, failure);
});
