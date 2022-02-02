import { PhantomSkipper, RealMouse, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.plugins.paste.CutTest', () => {
  before(function () {
    // Cut doesn't seem to work in webdriver mode on ie
    const platform = PlatformDetection.detect();
    if (platform.browser.isIE() || PhantomSkipper.detect()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: false,
    statusbar: false
  }, [ Plugin, Theme ]);

  it('TBA: Set and select content, cut using edit menu and assert cut content', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 2);
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
    await RealMouse.pClickOn('div[title="Cut"]');
    await Waiter.pTryUntil('Cut is async now, so need to wait for content', () => TinyAssertions.assertContent(editor, '<p>ac</p>'));
  });
});
