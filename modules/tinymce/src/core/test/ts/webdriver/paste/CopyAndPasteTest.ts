import { RealClipboard, RealMouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.paste.CopyAndPasteTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: false,
    statusbar: false
  }, []);

  type Selection = [ number[], number, number[], number ];

  const pCopyAndPaste = async (editor: Editor, source: Selection, target: Selection): Promise<void> => {
    TinySelections.setSelection(editor, ...source);
    // at the moment: RealClipboard.pCopy('iframe => body'), doesn't work in with all browser (see https://github.com/webdriverio/webdriverio/issues/622)
    // chrome, chrome-headless, firefox-headless -> it doesn't work
    // firefox -> it works
    TinyUiActions.clickOnMenu(editor, 'button:contains("Edit")');
    await TinyUiActions.pWaitForUi(editor, '*[role="menu"]');
    await RealMouse.pClickOn('div[title="Copy"]');
    TinySelections.setSelection(editor, ...target);
    await RealClipboard.pPaste('iframe => body');
  };

  it('TINY-7719: Wrapped elements are preserved in copy and paste (headings)', async () => {
    const editor = hook.editor();

    const pTestBlockTags = async (tagName: string) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<p>other kind of tag</p>' +
        `<${tagName}>same tag</${tagName}>`
      );
      await pCopyAndPaste(
        editor,
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 2, 0 ], 1, [ 2, 0 ], 3 ]
      );
      await pCopyAndPaste(
        editor,
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 1, 0 ], 1, [ 1, 0 ], 4 ]
      );
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>o</p>\n' +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>r kind of tag</p>\n' +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        `<${tagName}>e tag</${tagName}>`
      );
    };

    for (const tagName of [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ]) {
      await pTestBlockTags(tagName);
    }
  });

  it('TINY-7719: Wrapped elements are preserved in copy and paste (pre)', async () => {
    const editor = hook.editor();

    const pTestPreTag = async (tagName: string) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<p>other kind of tag</p>' +
        `<${tagName}>same tag</${tagName}>`
      );
      await pCopyAndPaste(
        editor,
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 2, 0 ], 1, [ 2, 0 ], 3 ]
      );
      await pCopyAndPaste(
        editor,
        [[ 0, 0 ], 0, [ 0, 0 ], 3 ],
        [[ 1, 0 ], 1, [ 1, 0 ], 4 ]
      );
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>o</p>\n' +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>r kind of tag</p>\n' +
        `<${tagName}>sabce tag</${tagName}>`
      );
    };

    for (const tagName of [ 'pre' ]) {
      await pTestPreTag(tagName);
    }
  });

  it('TINY-7719: Wrapped elements are preserved in copy and paste (inline elements)', async () => {
    const editor = hook.editor();

    const pTestInlineTags = async (tagName: string) => {
      editor.setContent(
        `<p><${tagName} class="someclass">abc</${tagName}></p>` +
        '<h1>something</h1>' +
        '<p>abc def</p>'
      );
      await pCopyAndPaste(
        editor,
        [[ 0, 0, 0 ], 0, [ 0, 0, 0 ], 3 ],
        [[ 1, 0 ], 1, [ 1, 0 ], 4 ]
      );
      TinyAssertions.assertContent(editor,
        `<p><${tagName} class="someclass">abc</${tagName}></p>\n` +
        `<h1>s<${tagName} class="someclass">abc</${tagName}>thing</h1>\n` +
        '<p>abc def</p>'
      );
    };

    const inlineElements = [
      'big', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code',
      'dfn', 'em', 'kbd', 'strong', 'samp', 'var', 'a', 'bdo',
      'map', 'q', 'span', 'sub', 'sup', 'button', 'label'
    ];

    for (const tagName of inlineElements) {
      await pTestInlineTags(tagName);
    }
  });
});
