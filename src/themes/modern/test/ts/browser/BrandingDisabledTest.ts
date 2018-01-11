import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.themes.modern.test.BradingDisabledTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Logger.t('Branding element should not exist', UiFinder.sNotExists(Element.fromDom(editor.getContainer()), '.mce-branding'))
    ], onSuccess, onFailure);
  }, {
    theme: 'modern',
    skin_url: '/project/js/tinymce/skins/lightgray',
    branding: false
  }, success, failure);
});
