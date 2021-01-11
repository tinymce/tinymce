import { Log, PhantomSkipper, Pipeline, RealMouse, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';

import PastePlugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('webdriver.tinymce.plugins.paste.CutTest', (success, failure) => {

  Theme();
  PastePlugin();

  const platform = PlatformDetection.detect();

  /* Test does not work on Phantom */
  if (PhantomSkipper.detect()) {
    return success();
  }

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const api = TinyApis(editor);
    const ui = TinyUi(editor);

    // Cut doesn't seem to work in webdriver mode on ie
    Pipeline.async({}, platform.browser.isIE() ? [] :
      Log.steps('TBA', 'Paste: Set and select content, cut using edit menu and assert cut content', [
        api.sSetContent('<p>abc</p>'),
        api.sSetSelection([ 0, 0 ], 1, [ 0, 0 ], 2),
        ui.sClickOnMenu('Click Edit menu', 'button:contains("Edit")'),
        ui.sWaitForUi('Wait for dropdown', '*[role="menu"]'),
        RealMouse.sClickOn('div[title="Cut"]'),
        Waiter.sTryUntil('Cut is async now, so need to wait for content', api.sAssertContent('<p>ac</p>'))
      ]), onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce',
    theme: 'silver',
    statusbar: false
  }, success, failure);
});
