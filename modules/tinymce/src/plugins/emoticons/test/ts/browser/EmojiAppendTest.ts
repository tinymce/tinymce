import { ApproxStructure, Assertions, FocusTools, Keys, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Attribute, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/emoticons/Plugin';

import { fakeEvent } from '../module/test/Utils';

describe('browser.tinymce.plugins.emoticons.EmojiAppendTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'emoticons',
    toolbar: 'emoticons',
    base_url: '/project/tinymce/js/tinymce',
    emoticons_database_url: '/project/tinymce/src/plugins/emoticons/test/js/test-emojis.js',
    emoticons_database_id: 'tinymce.plugins.emoticons.test-emojis.js',
    emoticons_append: {
      clock: {
        keywords: [ 'clock', 'time' ],
        char: '⏲'
      },
      brain_explode: {
        keywords: [ 'brain', 'explode', 'blown' ],
        char: '🤯'
      }
    }
  }, [ Plugin ], true);

  const tabElement = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi, arr: ApproxStructure.ArrayApi) =>
    (name: string): StructAssert => s.element('div', {
      attrs: {
        role: str.is('tab')
      },
      classes: [ arr.has('tox-tab'), arr.has('tox-dialog__body-nav-item') ],
      children: [
        s.text(str.is(name))
      ]
    });

  it('TBA: Open dialog, verify custom categories listed and search for custom emoji', async () => {
    const editor = hook.editor();
    const doc = SugarDocument.getDocument();

    TinyUiActions.clickOnToolbar(editor, 'button');
    await TinyUiActions.pWaitForDialog(editor);
    await FocusTools.pTryOnSelector('Focus should start on input', doc, 'input');
    const tabList = UiFinder.findIn(SugarBody.body(), '[role="tablist"]').getOrDie();
    Assertions.assertStructure('check custom categories are shown', ApproxStructure.build((s, str, arr) => s.element('div', {
      children: [
        tabElement(s, str, arr)('All'),
        tabElement(s, str, arr)('People'),
        tabElement(s, str, arr)('User Defined')
      ]
    })), tabList);

    const input = FocusTools.setActiveValue(doc, 'clock');
    fakeEvent(input, 'input');
    await Waiter.pTryUntil(
      'Wait until clock is the first choice (search should filter)',
      () => {
        const item = UiFinder.findIn(SugarBody.body(), '.tox-collection__item:first').getOrDie();
        const value = Attribute.get(item, 'data-collection-item-value');
        assert.equal(value, '⏲', 'Search should show custom clock');
      }
    );
    TinyUiActions.keydown(editor, Keys.tab());
    await FocusTools.pTryOnSelector('Focus should have moved to collection', doc, '.tox-collection__item');
    TinyUiActions.keydown(editor, Keys.enter());
    await Waiter.pTryUntil(
      'Waiting for content update',
      () => TinyAssertions.assertContent(editor, '<p>⏲</p>')
    );
  });
});
