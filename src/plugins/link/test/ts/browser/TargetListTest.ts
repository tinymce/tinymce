import { Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyDom, TinyLoader, TinyUi } from '@ephox/mcagar';

import LinkPlugin from 'tinymce/plugins/link/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';

UnitTest.asynctest('browser.tinymce.plugins.link.TargetListTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  LinkPlugin();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      // show target list by default
      tinyUi.sClickOnToolbar('click on link button', 'div[aria-label="Insert/edit link"] > button'),
      tinyUi.sWaitForPopup('wait for link dialog', 'div[aria-label="Insert link"][role="dialog"]'),
      UiFinder.sExists(TinyDom.fromDom(document.body), 'label:contains("Target")'),
      tinyUi.sClickOnUi('click on cancel', 'button:contains("Cancel")'),

      // but not when setting set to false
      tinyApis.sSetSetting('target_list', false),
      tinyUi.sClickOnToolbar('click on link button', 'div[aria-label="Insert/edit link"] > button'),
      tinyUi.sWaitForPopup('wait for link dialog', 'div[aria-label="Insert link"][role="dialog"]'),
      UiFinder.sNotExists(TinyDom.fromDom(document.body), 'label:contains("Target")'),
      tinyUi.sClickOnUi('click on cancel', 'button:contains("Cancel")')
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
