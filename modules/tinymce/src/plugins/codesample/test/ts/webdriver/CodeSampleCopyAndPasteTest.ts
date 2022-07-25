import { Keys, RealClipboard, RealMouse } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

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

  const browser = PlatformDetection.detect().browser;

  const pClickEditMenu = async (editor: Editor, item: string): Promise<void> => {
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
    await RealMouse.pClickOn(`div[title=${item}]`);
  };

  const pPaste = async (editor: Editor): Promise<void> => {
    if (PlatformDetection.detect().browser.isSafari()) {
      await pClickEditMenu(editor, 'Paste');
    } else {
      await RealClipboard.pPaste('iframe => body');
    }
  };

  const getMockPreString = (content: string) => browser.isFirefox() ?
    `<pre class="language-markup" data-mce-highlighted="true" contenteditable="false">${content}</pre>` :
    `<pre class="language-markup" contenteditable="false" data-mce-highlighted="true">${content}</pre>`;

  beforeEach(() => {
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
      getMockPreString('test content') +
      getMockPreString('test content'),
      { format: 'raw' }
    );
  });

  it('TINY-8861: copying and pasting a piece of code and a text should leave the cursor on the text after paste', async () => {
    const editor = hook.editor();
    editor.setContent(
      '<pre class="language-markup" contenteditable="false" data-mce-highlighted="true">test content</pre>' +
      '<p>test text</p>'
    );

    TinySelections.setSelection(editor, [], 0, [ ((browser.isFirefox() || browser.isSafari()) ? 1 : 2), 0 ], 9);

    await RealClipboard.pCopy('iframe => body');
    TinySelections.setCursor(editor, [ 1 ], 1);

    await pPaste(editor);
    pressEnter(editor);

    TinyAssertions.assertContent(editor,
      getMockPreString('test content') +
      '<p>test text</p>' +
      getMockPreString('test content') +
      '<p>test text</p>' +
      '<p><br data-mce-bogus="1"></p>',
      { format: 'raw' }
    );
  });
});
