import { ApproxStructure, Keys, RealClipboard, RealMouse, StructAssert } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyContentActions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/codesample/Plugin';

import * as TestUtils from '../module/CodeSampleTestUtils';

describe('webdriver.tinymce.plugins.codesample.CodeSampleCopyAndPasteTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'codesample',
    toolbar: 'codesample',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const pressEnter = (editor: Editor) => TinyContentActions.keystroke(editor, Keys.enter());

  const pClickEditMenu = async (editor: Editor, item: string): Promise<void> => {
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
    await RealMouse.pClickOn(`div[title=${item}]`);
  };

  const pPaste = async (editor: Editor): Promise<void> => {
    if (browser.isSafari()) {
      await pClickEditMenu(editor, 'Paste');
    } else {
      await RealClipboard.pPaste('iframe => body');
    }
  };

  const getMockPreStructure = (s: ApproxStructure.StructApi, str: ApproxStructure.StringApi): StructAssert =>
    s.element('pre', {
      attrs: {
        'class': str.is('language-markup'),
        'data-mce-highlighted': str.is('true'),
        'contenteditable': str.is('false'),
      },
      children: [
        s.text(str.is('test content'))
      ]
    });

  beforeEach(() => {
    hook.editor().setContent('');
  });

  it('TINY-8861: press enter after pasting a code sample should not add a newline inside the code', async () => {
    const editor = hook.editor();
    editor.setContent('<p><br /></p><p><br /></p>');
    await TestUtils.pOpenDialogAndAssertInitial(hook.editor(), 'markup', '');
    TestUtils.setTextareaContent('test content');
    await TestUtils.pSubmitDialog(editor);
    TinyAssertions.assertSelection(editor, [], 0, [], 1);
    TinyAssertions.assertContentPresence(editor, { 'pre[data-mce-selected]': 1 });

    await pClickEditMenu(editor, 'Copy');
    TinySelections.setCursor(editor, [ 1 ], 0);
    TinyAssertions.assertContentPresence(editor, { 'pre[data-mce-selected]': 0 });

    await pPaste(editor);
    TinyAssertions.assertSelection(editor, [], 1, [], 2);
    TinyAssertions.assertContentPresence(editor, { 'pre[data-mce-selected]': 1 });

    // Pressing <enter> should do nothing.
    pressEnter(editor);
    TinyAssertions.assertSelection(editor, [], 1, [], 2);
    TinyAssertions.assertContentPresence(editor, { 'pre[data-mce-selected]': 1 });

    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: [
          getMockPreStructure(s, str),
          getMockPreStructure(s, str),
          s.element('div', {
            // offscreen selection of cef because the second pre still has the selection
            classes: [ arr.has('mce-offscreen-selection') ]
          })
        ]
      });
    }));
  });

  // Safari cannot select the CEF in this scenario, so we can't run the test (and there is no bug)
  if (!browser.isSafari()) {
    it('TINY-8861: copying and pasting a piece of code and a text should leave the cursor on the text after paste', async () => {
      const editor = hook.editor();
      editor.setContent(
        '<pre class="language-markup" contenteditable="false" data-mce-highlighted="true">test content</pre>' +
      '<p>test text</p>'
      );

      editor.execCommand('SelectAll');

      await pClickEditMenu(editor, 'Copy');
      TinySelections.setCursor(editor, [ 1 ], 1);

      await pPaste(editor);
      TinyAssertions.assertCursor(editor, [ 3, 0 ], 'test text'.length);
      TinyAssertions.assertContentPresence(editor, { 'pre[data-mce-selected]': 0 });

      pressEnter(editor);
      TinyAssertions.assertCursor(editor, [ 4 ], 0);

      TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str) => {
        const testTextParagraph = s.element('p', {
          children: [
            s.text(str.is('test text'))
          ]
        });
        return s.element('body', {
          children: [
            getMockPreStructure(s, str),
            testTextParagraph,
            getMockPreStructure(s, str),
            testTextParagraph,
            s.element('p', {
              children: [
                s.element('br', {
                  attrs: {
                    'data-mce-bogus': str.is('1')
                  }
                })
              ]
            }),
          ]
        });
      }));
    });
  }
});
