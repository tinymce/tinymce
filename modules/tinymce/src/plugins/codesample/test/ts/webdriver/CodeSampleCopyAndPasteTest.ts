import { ApproxStructure, Keys, RealClipboard, RealMouse } from '@ephox/agar';
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
    if (browser.isSafari()) {
      await pClickEditMenu(editor, 'Paste');
    } else {
      await RealClipboard.pPaste('iframe => body');
    }
  };

  const getMockPreStructure = (s, str) =>
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

  it('TINY-8861: press enter after paste a code sample should not add newline inside the code', async () => {
    const editor = hook.editor();

    await TestUtils.pOpenDialogAndAssertInitial(hook.editor(), 'markup', '');
    TestUtils.setTextareaContent('test content');
    await TestUtils.pSubmitDialog(editor);
    await pClickEditMenu(editor, 'Copy');
    pressEnter(editor);
    await pPaste(editor);
    pressEnter(editor);

    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
      const emptyParagraph = s.element('p', {
        children: [
          s.element('br', {})
        ]
      });
      return s.element('body', {
        children: [
          emptyParagraph,
          emptyParagraph,
          s.element('p', {
            attrs: {
              // fake caret
              'data-mce-caret': str.is('before'),
              'data-mce-bogus': str.is('all')
            },
            children: [
              s.element('br', {})
            ]
          }),
          getMockPreStructure(s, str),
          getMockPreStructure(s, str),
          s.element('div', {
            // fake caret
            classes: [ arr.has('mce-visual-caret') ]
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
      pressEnter(editor);

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
