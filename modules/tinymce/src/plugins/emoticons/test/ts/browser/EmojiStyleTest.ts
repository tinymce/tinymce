import { FocusTools, UiFinder } from '@ephox/agar';
import { after, before, describe, it } from '@ephox/bedrock-client';
import { Global } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/emoticons/Plugin';

describe('browser.tinymce.plugins.emoticons.EmojiStyleTest', () => {
  before(function () {
    // TODO: TINY-6905: Test is flaking on Chromium Edge 86, so we need to investigate
    const platform = PlatformDetection.detect();
    if (platform.browser.isChromium() && platform.os.isWindows()) {
      this.skip();
    }
  });

  const databaseId = 'tinymce.plugins.emoticons';
  const databaseUrl = '/project/tinymce/src/plugins/emoticons/main/js/emojis.js';

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'emoticons',
    toolbar: 'emoticons',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: databaseUrl
  }, [ Plugin ], true);

  after(() => {
    Global.tinymce?.Resource.unload(databaseId);
  });

  it('TINY-10636: hover on emoji should have box-shadow', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    // The plugin starts loading the database on editor init; wait for it so the dialog populates within the
    // default wait. This must not live in a before() hook: bedrock escalates rejected async hooks to fatal
    // runner errors, whereas here a failed load reports as a normal test failure.
    await Global.tinymce.Resource.load(databaseId, databaseUrl);

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
