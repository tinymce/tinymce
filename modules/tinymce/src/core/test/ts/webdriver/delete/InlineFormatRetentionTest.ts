import { RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.delete.InlineFormatRetentionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    indent: false
  }, [], true);

  const browser = PlatformDetection.detect().browser;

  const doNativeBackspace = async () => {
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.backspace() ]);
  };

  it('TINY-9302: Backspace entire selection of block containing underlined text and then typing will produce underlined text will not produce unexpected formats', async () => {
    const editor = hook.editor();
    // second paragraph to ensure BlockRangeDelete override not triggered when everything is selected
    editor.setContent('<p><span style="text-decoration: underline;">abc</span></p><p>&nbsp;</p>');
    TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 3);
    await doNativeBackspace();
    // firefox natively preserves formats for block deletion
    TinyAssertions.assertContent(editor, browser.isFirefox() ? '<p><span style="text-decoration: underline;">&nbsp;</span></p><p>&nbsp;</p>' : '<p>&nbsp;</p><p>&nbsp;</p>');
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('d') ]);
    TinyAssertions.assertContent(editor, browser.isFirefox() ? '<p><span style="text-decoration: underline;">d<br></span></p><p>&nbsp;</p>' : '<p><span style="text-decoration: underline;">d</span></p><p>&nbsp;</p>');
  });

  it('TINY-9302: Backspace partial selection of underlined text within block then typing will not produce unexpected formats', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a<span style="text-decoration: underline;">bcd</span>e</p>');
    TinySelections.setSelection(editor, [ 0, 1, 0 ], 0, [ 0, 2 ], 1);
    await doNativeBackspace();
    TinyAssertions.assertContent(editor, '<p>a</p>');
    await RealKeys.pSendKeysOn('iframe => body', [ RealKeys.text('d') ]);
    // chrome and safari disregards caret format when surrounded by unformatted text
    TinyAssertions.assertContent(editor, browser.isFirefox() ? '<p>a<span style="text-decoration: underline;">d</span></p>' : '<p>ad</p>');
  });
});
