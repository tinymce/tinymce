import { Cursors, RealClipboard } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('webdriver.tinymce.core.paste.CopyAndPasteTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: false,
    statusbar: false
  }, [], true);

  const pCopyAndPaste = async (editor: Editor, source: Cursors.CursorPath, target: Cursors.CursorPath): Promise<void> => {
    TinySelections.setSelection(editor, source.startPath, source.soffset, source.finishPath, source.foffset);
    await RealClipboard.pCopy('iframe => body');
    TinySelections.setSelection(editor, target.startPath, target.soffset, target.finishPath, target.foffset);
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
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 3 },
        { startPath: [ 2, 0 ], soffset: 1, finishPath: [ 2, 0 ], foffset: 3 }
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 3 },
        { startPath: [ 1, 0 ], soffset: 1, finishPath: [ 1, 0 ], foffset: 4 }
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
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 3 },
        { startPath: [ 2, 0 ], soffset: 1, finishPath: [ 2, 0 ], foffset: 3 }
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 0, 0 ], foffset: 3 },
        { startPath: [ 1, 0 ], soffset: 1, finishPath: [ 1, 0 ], foffset: 4 }
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

  it('TINY-7719: if the copy has multiple tags in it, it should be preserved (pre)', async () => {
    const editor = hook.editor();

    const pTestPreTag = async (tagName: string) => {
      editor.setContent(
        `<${tagName}>abc</${tagName}>` +
        '<p>other kind of tag</p>' +
        `<${tagName}>same tag</${tagName}>`
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 0, 0 ], soffset: 0, finishPath: [ 1, 0 ], foffset: 5 },
        { startPath: [ 2, 0 ], soffset: 1, finishPath: [ 2, 0 ], foffset: 3 }
      );
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>other kind of tag</p>\n' +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>other</p>\n' +
        `<${tagName}>e tag</${tagName}>`
      );
      await pCopyAndPaste(
        editor,
        { startPath: [ 2, 0 ], soffset: 0, finishPath: [ 3, 0 ], foffset: 3 },
        { startPath: [ 5, 0 ], soffset: 1, finishPath: [ 5, 0 ], foffset: 3 }
      );
      TinyAssertions.assertContent(editor,
        `<${tagName}>abc</${tagName}>\n` +
        '<p>other kind of tag</p>\n' +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        '<p>other</p>\n' +
        `<${tagName}>e</${tagName}>\n` +
        `<${tagName}>s</${tagName}>\n` +
        `<${tagName}>abc</${tagName}>\n` +
        `<${tagName}>ag</${tagName}>`
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
        { startPath: [ 0, 0, 0 ], soffset: 0, finishPath: [ 0, 0, 0 ], foffset: 3 },
        { startPath: [ 1, 0 ], soffset: 1, finishPath: [ 1, 0 ], foffset: 4 }
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
