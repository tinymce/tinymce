import { Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/wordcount/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.wordcount.PluginTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'wordcount',
    base_url: '/project/tinymce/js/tinymce'
  }, [ () => Plugin(2), Theme ], true);

  beforeEach(() => {
    hook.editor().setContent('');
  });

  const assertWordcount = (num: number) => {
    const countEl = DOMUtils.DOM.select('.tox-statusbar__wordcount')[0];
    const value = countEl ? countEl.innerText : '';
    assert.equal(value.toUpperCase(), num + ' WORDS', 'wordcount');
  };

  const pWaitForWordcount = (num: number) =>
    Waiter.pTryUntil('Wait for wordcount to change', () => assertWordcount(num));

  it('Set test content and assert word count', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    editor.setContent('<p>hello world</p>');
    await pWaitForWordcount(2);
  });

  it('Test keystroke and assert word count', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    TinyContentActions.type(editor, 'a b c');
    await pWaitForWordcount(3);
  });

  it('Test undo and redo', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    editor.setContent('<p>a b c</p>');
    await pWaitForWordcount(3);
    editor.execCommand('undo');
    TinyAssertions.assertContent(editor, '');
    await pWaitForWordcount(0);
    editor.execCommand('redo');
    TinyAssertions.assertContent(editor, '<p>a b c</p>');
    await pWaitForWordcount(3);
    editor.setContent('<p>hello world</p>', { format: 'raw' });
    editor.execCommand('mceAddUndoLevel');
    await pWaitForWordcount(2);
  });

  it('TINY-7908: Does not treat soft hyphens as a word break', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    editor.setContent('<p>Soft hy&shy;phen</p>');
    await pWaitForWordcount(2);
  });
});
