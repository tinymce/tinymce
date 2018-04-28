import { Logger, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';

import Theme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('tinymce.themes.modern.test.browser.BradingEnabledTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Logger.t('Branding element should exist', UiFinder.sExists(Element.fromDom(editor.getContainer()), '.mce-branding'))
    ], onSuccess, onFailure);
  }, {
    theme: 'modern',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
