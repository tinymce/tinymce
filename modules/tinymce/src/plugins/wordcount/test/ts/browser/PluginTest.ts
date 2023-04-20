import { Waiter } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/wordcount/Plugin';

describe('browser.tinymce.plugins.wordcount.PluginTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'wordcount',
    base_url: '/project/tinymce/js/tinymce'
  }, [ () => Plugin(2) ], true);

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

  const testWordcount = async (editor: Editor, scenarios: { content: string; expected: number }[]): Promise<void> => {
    for (let i = 0; i < scenarios.length; i++) {
      editor.setContent(scenarios[i].content);
      await pWaitForWordcount(scenarios[i].expected);
    }
  };

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
    editor.undoManager.add();
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

  it('TINY-7484: Does not treat zwsp character as splitting a word', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    editor.setContent('<p><span>wo&#8203;rd</span></p>');
    await pWaitForWordcount(1);
  });

  it('TINY-7484: Does not treat zwsp character as a word', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span>word&#8203;</span></p>');
    await pWaitForWordcount(1);
    editor.setContent('<p><span>&#8203;</span></p>');
    await pWaitForWordcount(0);
  });

  it('TINY-7484: Multiple zwsp characters', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    editor.setContent('<p><span>&#8203;&#8203;&#8203;wo&#8203;rd&#8203;&#8203;&#8203;</span></p>');
    await pWaitForWordcount(1);
  });

  it('TINY-8122: Treat $ as a word break', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    const wordCountScenarios = [
      { content: '<p>$word</p>', expected: 1 },
      { content: '<p>word$</p>', expected: 1 },
      { content: '<p>word$word</p>', expected: 2 },
      { content: '<p>$word$</p>', expected: 1 },
      { content: '<p>word$2</p>', expected: 2 },
      { content: '<p>word$word test</p>', expected: 3 },
      { content: '<p>word$word<br/>test$</p>', expected: 3 },
      { content: '<p>word$word</p><p>test$</p>', expected: 3 }
    ];

    await testWordcount(editor, wordCountScenarios);
  });

  it('TINY-8122: Treat ^ as a word break', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    const wordCountScenarios = [
      { content: '<p>^word</p>', expected: 1 },
      { content: '<p>word^</p>', expected: 1 },
      { content: '<p>word^word</p>', expected: 2 },
      { content: '<p>^word^</p>', expected: 1 },
      { content: '<p>word^2</p>', expected: 2 },
      { content: '<p>word^word test</p>', expected: 3 },
      { content: '<p>word^word<br/>test^</p>', expected: 3 },
      { content: '<p>word^word</p><p>test^</p>', expected: 3 }
    ];

    await testWordcount(editor, wordCountScenarios);
  });

  it('TINY-8122: Treat ~ as a word break', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    const wordCountScenarios = [
      { content: '<p>~word</p>', expected: 1 },
      { content: '<p>word~</p>', expected: 1 },
      { content: '<p>word~word</p>', expected: 2 },
      { content: '<p>~word~</p>', expected: 1 },
      { content: '<p>word~2</p>', expected: 2 },
      { content: '<p>word~word test</p>', expected: 3 },
      { content: '<p>word~word<br/>test~</p>', expected: 3 },
      { content: '<p>word~word</p><p>test~</p>', expected: 3 }
    ];

    await testWordcount(editor, wordCountScenarios);
  });

  it('TINY-8122: Treat | as a word break', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    const wordCountScenarios = [
      { content: '<p>|word</p>', expected: 1 },
      { content: '<p>word|</p>', expected: 1 },
      { content: '<p>word|word</p>', expected: 2 },
      { content: '<p>|word|</p>', expected: 1 },
      { content: '<p>word|2</p>', expected: 2 },
      { content: '<p>word|word test</p>', expected: 3 },
      { content: '<p>word|word<br/>test|</p>', expected: 3 },
      { content: '<p>word|word</p><p>test|</p>', expected: 3 }
    ];

    await testWordcount(editor, wordCountScenarios);
  });

  it('TINY-8122: Treat № as a word break', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    const wordCountScenarios = [
      { content: '<p>№word</p>', expected: 1 },
      { content: '<p>word№</p>', expected: 1 },
      { content: '<p>word№word</p>', expected: 2 },
      { content: '<p>№word№</p>', expected: 1 },
      { content: '<p>word№2</p>', expected: 2 },
      { content: '<p>word№word test</p>', expected: 3 },
      { content: '<p>word№word<br/>test№</p>', expected: 3 },
      { content: '<p>word№word</p><p>test№</p>', expected: 3 }
    ];

    await testWordcount(editor, wordCountScenarios);
  });

  it('TINY-8122: + should be a word break when not next to number', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    const wordCountScenarios = [
      { content: '<p>+word</p>', expected: 1 },
      { content: '<p>word+</p>', expected: 1 },
      { content: '<p>word+word</p>', expected: 2 },
      { content: '<p>+word+</p>', expected: 1 },
      { content: '<p>word+2</p>', expected: 2 },
      { content: '<p>word+word test</p>', expected: 3 },
      { content: '<p>word+word<br/>test+</p>', expected: 3 },
      { content: '<p>word+word</p><p>test+</p>', expected: 3 }
    ];

    await testWordcount(editor, wordCountScenarios);
  });

  it('TINY-1166: Applying inline formats within same word', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    editor.setContent('<p>a</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 1);
    await pWaitForWordcount(1);
    editor.execCommand('Bold');
    await pWaitForWordcount(1);
    TinyContentActions.type(editor, 'b');
    await pWaitForWordcount(1);
  });

  it('TINY-8122: Treat ` as a word break', async () => {
    const editor = hook.editor();
    await pWaitForWordcount(0);
    const wordCountScenarios = [
      { content: '<p>`word</p>', expected: 1 },
      { content: '<p>word`</p>', expected: 1 },
      { content: '<p>word`word</p>', expected: 2 },
      { content: '<p>`word`</p>', expected: 1 },
      { content: '<p>word`2</p>', expected: 2 },
      { content: '<p>word`word test</p>', expected: 3 },
      { content: '<p>word`word<br/>test`</p>', expected: 3 },
      { content: '<p>word`word</p><p>test`</p>', expected: 3 },
      { content: '<p>`1234`1234</p>', expected: 2 },
      { content: '<p>`1234`1234`1234` 1234</p>', expected: 4 }
    ];

    await testWordcount(editor, wordCountScenarios);
  });
});
