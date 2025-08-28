import { ApproxStructure, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyHooks, TinyUiActions, TinySelections, TinyAssertions, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/visualchars/Plugin';

import { assertSpanStruct, assertNbspStruct, assertStruct } from '../module/test/Utils';

describe('browser.tinymce.plugins.visualchars.PluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  it('TBA: Set content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;&nbsp;b</p>');
    assert.lengthOf(editor.dom.select('span'), 0);
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertSpanStruct(editor));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertNbspStruct(editor));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertSpanStruct(editor));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertNbspStruct(editor));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertSpanStruct(editor));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertNbspStruct(editor));
  });

  it('TINY-4507: Set content with HTML like content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', async () => {
    const editor = hook.editor();
    editor.setContent('<p>&lt;img src=&quot;image.png&quot;&gt;&nbsp;</p>');

    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars', () => assertStruct(editor, ApproxStructure.build((s, str) => [
      s.text(str.is('<img src="image.png">')),
      s.element('span', {})
    ])));

    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to disappear', () => assertStruct(editor, ApproxStructure.build((s, str) => [
      s.text(str.is('<img src="image.png">')),
      s.text(str.is(Unicode.nbsp))
    ])));
  });

  it('TINY-8599: toggling visual chars should retain selection direction', async () => {
    const editor = hook.editor();
    editor.setContent('<p>abc&nbsp;&nbsp;</p>');

    TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 3);
    editor.selection.setRng(editor.selection.getRng(), false);

    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => assertStruct(editor, ApproxStructure.build((s, str) => [
      s.text(str.is('abc')),
      s.element('span', {}),
      s.element('span', {})
    ])));

    assert.isFalse(editor.selection.isForward(), 'should still be backwards');

    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to disappear', () => assertStruct(editor, ApproxStructure.build((s, str) => [
      s.text(str.is('abc\u00a0')),
      s.text(str.is(Unicode.nbsp))
    ])));

    assert.isFalse(editor.selection.isForward(), 'should still be backwards');
  });

  it('TINY-9474: should not process noneditable elements', async () => {
    const editor = hook.editor();

    editor.setContent('<p contenteditable="false">abc&nbsp;&nbsp;</p><p>123&nbsp;&nbsp;</p>');
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => {
      TinyAssertions.assertContentPresence(editor, {
        'span.mce-nbsp': 2
      });
    });
    TinyUiActions.clickOnToolbar(editor, 'button');
  });

  it('TINY-9474: should not process noneditable elements in a noneditable root', async () => {
    await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
      editor.setContent('<p>abc&nbsp;&nbsp;</p><p contenteditable="true">123&nbsp;&nbsp;</p>');
      TinyUiActions.clickOnToolbar(editor, 'button');
      await Waiter.pTryUntil('wait for visual chars to appear', () => {
        TinyAssertions.assertContentPresence(editor, {
          'span.mce-nbsp': 2
        });
      });
      TinyUiActions.clickOnToolbar(editor, 'button');
    });
  });

  it('TINY-9685: should add "mce-nbsp" to "mce-nbsp-wrap" elements in editable context', async () => {
    await TinyState.withNoneditableRootEditorAsync(hook.editor(), async (editor) => {
      editor.setContent(`
        <p><span class="mce-nbsp-wrap" contenteditable="false">&nbsp;</span></p>
        <p contenteditable="true"><span class="mce-nbsp-wrap" contenteditable="false">&nbsp;</span></p>
      `);
      TinyUiActions.clickOnToolbar(editor, 'button');
      await Waiter.pTryUntil('wait for visual chars to appear', () => {
        TinyAssertions.assertContentPresence(editor, {
          'span.mce-nbsp': 1,
          '[contenteditable="true"] span.mce-nbsp': 1
        });
      });
      TinyUiActions.clickOnToolbar(editor, 'button');
    });
  });
});
