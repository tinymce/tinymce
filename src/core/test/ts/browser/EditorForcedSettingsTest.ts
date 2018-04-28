import { Assertions, Pipeline } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.EditorForcedSettingsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Assertions.sAssertEq('Validate should always be true', true, editor.settings.validate),
      Assertions.sAssertEq('Validate should true since inline was set to true', true, editor.settings.content_editable)
    ], onSuccess, onFailure);
  }, {
    skin_url: '/project/js/tinymce/skins/lightgray',

    // Setting exposed as another forced setting
    inline: true,

    // Settings that are to be forced
    validate: false
  }, success, failure);
});
