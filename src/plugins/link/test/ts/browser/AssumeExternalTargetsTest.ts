import { Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.plugins.link.AssumeExternalTargetsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  ModernTheme();
  LinkPlugin();

  const sEnterUrl = function (url) {
    return Step.sync(function () {
      const input: any = document.activeElement;

      input.value = url;
      DOMUtils.DOM.fire(input, 'change');
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      // with default setting, always prompts www.-urls, not other without protocol
      tinyUi.sClickOnToolbar('click on link button', 'div[aria-label="Insert/edit link"] > button'),
      tinyUi.sWaitForPopup('link popup', 'div[aria-label="Insert link"][role="dialog"]'),
      sEnterUrl('www.google.com'),
      tinyUi.sClickOnUi('click ok button', 'button > span:contains("Ok")'),
      tinyUi.sWaitForUi(
        'wait for dialog',
        'span:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
      ),
      tinyUi.sClickOnUi('click ok button', 'button > span:contains("Ok")'),
      tinyApis.sAssertContentPresence({ a: 1 }),
      tinyApis.sSetContent(''),
      tinyUi.sClickOnToolbar('click on link button', 'div[aria-label="Insert/edit link"] > button'),
      tinyUi.sWaitForPopup('link popup', 'div[aria-label="Insert link"][role="dialog"]'),
      sEnterUrl('google.com'),
      tinyUi.sClickOnUi('click ok button', 'button > span:contains("Ok")'),
      tinyApis.sAssertContentPresence({ a: 1 }),
      tinyApis.sSetContent(''),

      // with link_assume_external_targets: true, prompts on all, even without protocol
      tinyApis.sSetSetting('link_assume_external_targets', true),
      tinyUi.sClickOnToolbar('click on link button', 'div[aria-label="Insert/edit link"] > button'),
      tinyUi.sWaitForPopup('link popup', 'div[aria-label="Insert link"][role="dialog"]'),
      sEnterUrl('www.google.com'),
      tinyUi.sClickOnUi('click ok button', 'button > span:contains("Ok")'),
      tinyUi.sWaitForUi(
        'wait for dialog',
        'span:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
      ),
      tinyUi.sClickOnUi('click ok button', 'button > span:contains("Ok")'),
      tinyApis.sAssertContentPresence({ a: 1 }),
      tinyApis.sSetContent(''),
      tinyUi.sClickOnToolbar('click on link button', 'div[aria-label="Insert/edit link"] > button'),
      tinyUi.sWaitForPopup('link popup', 'div[aria-label="Insert link"][role="dialog"]'),
      sEnterUrl('google.com'),
      tinyUi.sClickOnUi('click ok button', 'button > span:contains("Ok")'),
      tinyUi.sWaitForUi(
        'wait for dialog',
        'span:contains("The URL you entered seems to be an external link. Do you want to add the required http:// prefix?")'
      ),
      tinyUi.sClickOnUi('click ok button', 'button > span:contains("Ok")'),
      tinyApis.sAssertContentPresence({ a: 1 }),
      tinyApis.sSetContent('')
    ], onSuccess, onFailure);
  }, {
    plugins: 'link',
    toolbar: 'link',
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
