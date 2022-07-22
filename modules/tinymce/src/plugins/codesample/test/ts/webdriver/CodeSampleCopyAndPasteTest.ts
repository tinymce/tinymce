import { Keys, RealClipboard } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/fullscreen/Plugin';

import * as TestUtils from '../module/CodeSampleTestUtils';

describe('webdriver.tinymce.plugins.codesample.CodeSampleCopyAndPasteTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'codesample',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const pressEnter = (editor: Editor) => {
    const overrides = { keyCode: Keys.enter() };

    const getInputEventArgs = (eventType: string) => ({ ...new window.InputEvent(eventType), ...overrides });
    const getKeyboardEventArgs = (eventType: string) => ({ ...new window.KeyboardEvent(eventType), ...overrides });

    editor.dispatch('keydown', getKeyboardEventArgs('keydown'));
    editor.dispatch('beforeinput', getInputEventArgs('beforeinput'));
    editor.dispatch('input', getInputEventArgs('input'));
    editor.dispatch('keyup', getKeyboardEventArgs('keyup'));
  };

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
      '<pre class="language-markup" contenteditable="false">test content</pre>' +
      '<pre class="language-markup" contenteditable="false">test content</pre>',
      { format: 'raw' }
    );
  });

  it('TINY-8861: coping and pating a piece of code and a text should leave the cursor on the text after paste', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<pre class="language-markup" contenteditable="false">test content</pre>' +
      '<p>test text</p>'
    );

    TinySelections.setSelection(editor, [ 0 ], 0, [ 2 ], 1);

    await RealClipboard.pCopy('iframe => body');
    TinySelections.setCursor(editor, [ 2 ], 1);

    await RealClipboard.pPaste('iframe => body');
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      '<pre class="language-markup" contenteditable="false">test content</pre>' +
      '<p>test text</p>' +
      '<pre class="language-markup" contenteditable="false">test content</pre>' +
      '<p>test text</p>' +
      '<p><br data-mce-bogus="1"></p>',
      { format: 'raw' }
    );
  });
});
