import { FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { before, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { Attribute, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/emoticons/Plugin';

import { fakeEvent } from '../module/test/Utils';

describe('browser.tinymce.plugins.emoticons.EmojiSearchTest', () => {
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

  it('TBA: Open dialog, Search for "rainbow", Rainbow should be first option', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    TinyUiActions.clickOnToolbar(editor, 'button');
    await TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Focus should start on input', doc, 'input');
    const input = FocusTools.setActiveValue(doc, 'rainbow');
    fakeEvent(input, 'input');
    await Waiter.pTryUntil(
      'Wait until rainbow is the first choice (search should filter)',
      () => {
        const item = UiFinder.findIn(SugarBody.body(), '.tox-collection__item:first').getOrDie();
        const value = Attribute.get(item, 'data-collection-item-value');
        assert.equal(value, '🌈', 'Search should show rainbow');
      }
    );
    TinyUiActions.keydown(editor, Keys.tab());
    await FocusTools.pTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item');
    TinyUiActions.keydown(editor, Keys.enter());
    await Waiter.pTryUntil(
      'Waiting for content update',
      () => TinyAssertions.assertContent(editor, '<p>🌈</p>')
    );
  });
});
