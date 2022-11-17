import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as InlineFormatDelete from 'tinymce/core/delete/InlineFormatDelete';

describe('webdriver.tinymce.core.delete.InlineFormatRetentionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  const browser = PlatformDetection.detect().browser;

  const doBackspace = (editor: Editor) => {
    const returnVal = InlineFormatDelete.backspaceDelete(editor, false);
    returnVal.each((apply) => apply());
    assert.isTrue(returnVal.isSome(), 'Should return true since the operation should have done something');
  };

  it('TINY-9302: Backspace entire selection of block containing underlined text and then typing will produce underlined text with correct span format', async () => {
    const editor = hook.editor();
    editor.setContent('<p><span style="text-decoration: underline;">abc</span></p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 3);
    doBackspace(editor);
    // firefox natively preserves formats
    TinyAssertions.assertContent(editor, browser.isFirefox() ? '<p><span style="text-decoration: underline;">&nbsp;</span></p>' : '');
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('d') ]);
    TinyAssertions.assertContent(editor, browser.isFirefox() ? '<p><span style="text-decoration: underline;">d<br></span></p>' : '<p><span style="text-decoration: underline;">d</span></p>');
  });

  it('TINY-9302: Backspace partial selection of underlined text within block then typing will produce underlined text with correct span format', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a<span style="text-decoration: underline;">bcd</span>e</p>');
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 2 ], 1);
    doBackspace(editor);
    TinyAssertions.assertContent(editor, '<p>a</p>');
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('d') ]);
    // chrome and safari disregards caret format when surrounded by unformatted text
    TinyAssertions.assertContent(editor, browser.isFirefox() ? '<p>a<span style="text-decoration: underline;">d</span></p>' : '<p>ad</p>');
  });
});
