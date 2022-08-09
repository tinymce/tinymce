import { FocusTools, Keys, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarBody, SugarDocument, SugarElement } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Resource from 'tinymce/core/api/Resource';
import Plugin from 'tinymce/plugins/emoticons/Plugin';

import { fakeEvent } from '../module/test/Utils';

describe('browser.tinymce.plugins.emoticons.ImageEmojiTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'emoticons',
    toolbar: 'emoticons',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/main/js/emojiimages.js',
    setup: () => {
      Resource.unload('tinymce.plugins.emoticons');
    }
  }, [ Plugin ], true);

  it('TBA: Open dialog, Search for "dog", Dog should be first option', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    TinyUiActions.clickOnToolbar(editor, 'button');
    await TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Focus should start on input', doc, 'input');
    const input = FocusTools.setActiveValue(doc, 'dog');
    fakeEvent(input, 'input');
    await Waiter.pTryUntil(
      'Wait until dog is the first choice (search should filter)',
      () => {
        const item = UiFinder.findIn(SugarBody.body(), '.tox-collection__item:first').getOrDie();
        const attr = Attribute.get(item, 'data-collection-item-value') as string;
        const img = SugarElement.fromHtml<HTMLImageElement>(attr);
        const src = Attribute.get(img, 'src');
        assert.equal(src, 'https://twemoji.maxcdn.com/v/13.0.1/72x72/1f436.png', 'Search should show a dog');
      }
    );
    TinyUiActions.keydown(editor, Keys.tab());
    await FocusTools.pTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item');
    TinyUiActions.keydown(editor, Keys.enter());
    await Waiter.pTryUntil(
      'Waiting for content update',
      () => TinyAssertions.assertContentPresence(editor, {
        'img[data-emoticon]': 1,
        'img[data-mce-resize="false"]': 1,
        'img[data-mce-placeholder="1"]': 1,
        'img[alt="\ud83d\udc36"]': 1,
        'img[src="https://twemoji.maxcdn.com/v/13.0.1/72x72/1f436.png"]': 1
      })
    );
  });
});
