import { FocusTools, UiFinder } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/emoticons/Plugin';

describe('browser.tinymce.plugins.emoticons.EmojiStyleTest', () => {
  before(function () {
    // TODO: TINY-6905: Test is flaking on Chromium Edge 86, so we need to investigate
    const platform = PlatformDetection.detect();
    if (platform.browser.isChromium() && platform.os.isWindows()) {
      this.skip();
    }
  });

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'emoticons',
    toolbar: 'emoticons',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/main/js/emojis.js'
  }, [ Plugin ], true);

  it('TINY-10636: hover on emoji should have box-shadow', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Emojis"]');
    await UiFinder.pWaitFor('waiting for emoji dialog', SugarBody.body(), 'div[aria-label="100"]');

    FocusTools.setFocus(doc, 'div[aria-label="100"]');
    await FocusTools.pTryOnSelector('waiting for emoji to be focused', doc, 'div[aria-label="100"]');
    const emoji = UiFinder.findIn(SugarBody.body(), 'div[aria-label="100"]').getOrDie().dom;
    // Currently there is no way to get the pseudo element styles in the Css module, so we are using the window.getComputedStyle
    const styles = window.getComputedStyle(emoji, ':after');

    // Check inset is not wrapped in single quotes
    assert.isFalse(styles.boxShadow.includes('\'inset\''), 'inset should not wrapped in single quotes');
  });
});
