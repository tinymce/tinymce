import { Pipeline, RealMouse, Waiter, Chain, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { window } from '@ephox/dom-globals';

UnitTest.asynctest('tinymce.plugins.paste.webdriver.CutTest', (success, failure) => {

  Theme();
  PastePlugin();

  const platform = PlatformDetection.detect();

  /* Test does not work on Phantom */
  if (window.navigator.userAgent.indexOf('PhantomJS') > -1) {
    return success();
  }

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    // Cut doesn't seem to work in webdriver mode on ie, firefox is producing moveto not supported, edge fails if it's not observed
    Pipeline.async({}, (platform.browser.isIE() || platform.browser.isFirefox() || platform.browser.isEdge()) ? [] :
    Log.steps('TBA', 'Paste: Set and select content, cut using edit menu and assert cut content', [
      api.sSetContent('<p>abc</p>'),
      api.sSetSelection([0, 0], 1, [0, 0], 2),
      ui.sClickOnMenu('Click Edit menu', 'button:contains("Edit")'),
      Chain.asStep({}, [
        ui.cWaitForUi('Wait for menu item', '[role="menuitem"]:contains("Cut")'),
        RealMouse.cClick()
      ]),
      Waiter.sTryUntil('Cut is async now, so need to wait for content', api.sAssertContent('<p>ac</p>'), 100, 1000)
    ]), onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver',
    statusbar: false
  }, success, failure);
});
