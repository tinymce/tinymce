import { Keys, RealClipboard } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/codesample/Plugin';

import * as TestUtils from '../module/CodeSampleTestUtils';

describe('webdriver.tinymce.plugins.codesample.CodeSampleCopyAndPasteTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'codesample',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const pressEnter = (editor: Editor) => TinyContentActions.keystroke(editor, Keys.enter());

  beforeEach(function () {
    const browser = PlatformDetection.detect().browser;
    if (browser.isSafari()) {
      this.skip();
    }
    hook.editor().setContent('');
  });

  it('TINY-8861: press enter after paste a code sample should not add newline inside the code', async () => {
    const editor = hook.editor();

    await TestUtils.pOpenDialogAndAssertInitial(hook.editor(), 'markup', '');
    TestUtils.setTextareaContent('test content');
    await TestUtils.pSubmitDialog(editor);
    await RealClipboard.pCopy('iframe => body');
    pressEnter(editor);
    await RealClipboard.pPaste('iframe => body');
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<p><br></p>' +
      '<p><br></p>' +
      '<pre class="language-markup" contenteditable="false" data-mce-highlighted="true">test content</pre>' +
      '<pre class="language-markup" contenteditable="false" data-mce-highlighted="true">test content</pre>',
      { format: 'raw' }
    );
  });

  it('TINY-8861: copying and pasting a piece of code and a text should leave the cursor on the text after paste', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<pre class="language-markup" contenteditable="false" data-mce-highlighted="true">test content</pre>' +
      '<p>test text</p>'
    );

    TinySelections.setSelection(editor, [ 0 ], 0, [ 2 ], 1);

    await RealClipboard.pCopy('iframe => body');
    TinySelections.setCursor(editor, [ 2 ], 1);

    await RealClipboard.pPaste('iframe => body');
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<pre class="language-markup" contenteditable="false" data-mce-highlighted="true">test content</pre>' +
      '<p>test text</p>' +
      '<pre class="language-markup" contenteditable="false" data-mce-highlighted="true">test content</pre>' +
      '<p>test text</p>' +
      '<p><br data-mce-bogus="1"></p>',
      { format: 'raw' }
    );
  });
});
