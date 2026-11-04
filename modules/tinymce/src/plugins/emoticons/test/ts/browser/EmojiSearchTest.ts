import { FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { after, describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { TinyMCE } from 'tinymce/core/api/Tinymce';
import Plugin from 'tinymce/plugins/emoticons/Plugin';

declare let tinymce: TinyMCE;

describe('browser.tinymce.plugins.emoticons.EmojiSearchTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'emoticons',
    toolbar: 'emoticons',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/main/js/emojis.js'
  }, [ Plugin ], true);

  after(() => {
    tinymce.Resource.unload('tinymce.plugins.emoticons');
  });

  it('TBA: Open dialog, Search for "rainbow", Rainbow should be first option', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    TinyUiActions.clickOnToolbar(editor, 'button');
    await TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Focus should start on input', doc, 'input');
    FocusTools.setActiveValue(doc, 'rainbow');
    await Waiter.pTryUntil(
      'Wait until rainbow is the first choice (search should filter)',
      () => {
        const item = UiFinder.findIn(SugarBody.body(), '.tox-collection__item:first-child').getOrDie();
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
