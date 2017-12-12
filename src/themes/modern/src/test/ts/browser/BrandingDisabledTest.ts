import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.themes.modern.test.BradingDisabledTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, [
      Logger.t('Branding element should not exist', UiFinder.sNotExists(Element.fromDom(editor.getContainer()), '.mce-branding'))
    ], onSuccess, onFailure);
  }, {
    theme: 'modern',
    skin_url: '/project/src/skins/lightgray/dist/lightgray',
    branding: false
  }, success, failure);
});

