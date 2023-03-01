import { Clipboard, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { PastePostProcessEvent, PastePreProcessEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InternalHtml from 'tinymce/core/paste/InternalHtml';
import TablePlugin from 'tinymce/plugins/table/Plugin';

describe('browser.tinymce.core.paste.InternalClipboardTest', () => {
  let dataTransfer: DataTransfer | undefined;
  let lastPreProcessEvent: EditorEvent<PastePreProcessEvent> | undefined;
  let lastPostProcessEvent: EditorEvent<PastePostProcessEvent> | undefined;

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    init_instance_callback: (editor: Editor) => {
      editor.on('PastePreProcess', (evt) => {
        lastPreProcessEvent = evt;
      });

      editor.on('PastePostProcess', (evt) => {
        lastPostProcessEvent = evt;
      });

      editor.on('copy cut paste', (e) => {
        dataTransfer = e.clipboardData;
      });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ TablePlugin ]);

  const resetProcessEvents = () => {
    lastPreProcessEvent = undefined;
    lastPostProcessEvent = undefined;
  };

  const cutCopyDataTransferEvent = (editor: Editor, type: 'cut' | 'copy') => {
    const action = type === 'cut' ? Clipboard.cut : Clipboard.copy;
    action(TinyDom.body(editor));
  };

  const pasteDataTransferEvent = (editor: Editor, data: Record<string, string>) =>
    Clipboard.pasteItems(TinyDom.body(editor), data);

  const assertClipboardData = (expectedHtml: string, expectedText: string) => {
    assert.equal(dataTransfer?.getData('text/html'), expectedHtml, 'text/html data should match');
    assert.equal(dataTransfer?.getData('text/plain'), expectedText, 'text/plain data should match');
  };

  const copy = (editor: Editor, html: string, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    editor.setContent(html);
    TinySelections.setSelection(editor, spath, soffset, fpath, foffset);
    cutCopyDataTransferEvent(editor, 'copy');
  };

  const cut = (editor: Editor, html: string, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    editor.setContent(html);
    TinySelections.setSelection(editor, spath, soffset, fpath, foffset);
    cutCopyDataTransferEvent(editor, 'cut');
  };

  const paste = (editor: Editor, startHtml: string, pasteData: Record<string, string>, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    editor.setContent(startHtml);
    TinySelections.setSelection(editor, spath, soffset, fpath, foffset);
    editor.undoManager.add(); // Undo level would not always be properly created in some situations, so we create it manually to prevent tests from failing when they shouldn't.
    resetProcessEvents();
    pasteDataTransferEvent(editor, pasteData);
  };

  context('copy', () => {
    it('TBA: Copy simple text', () => {
      const editor = hook.editor();
      copy(editor, '<p>text</p>', [ 0, 0 ], 0, [ 0, 0 ], 4);
      assertClipboardData('<!-- x-tinymce/html -->text', 'text');
      TinyAssertions.assertContent(editor, '<p>text</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    });

    it('TBA: Copy inline elements', () => {
      const editor = hook.editor();
      copy(editor, '<p>te<em>x</em>t</p>', [ 0, 0 ], 0, [ 0, 2 ], 1);
      assertClipboardData('<!-- x-tinymce/html -->te<em>x</em>t', 'text');
      TinyAssertions.assertContent(editor, '<p>te<em>x</em>t</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 1);
    });

    it('TBA: Copy partially selected inline elements', () => {
      const editor = hook.editor();
      copy(editor, '<p>a<em>cd</em>e</p>', [ 0, 0 ], 0, [ 0, 1, 0 ], 1);
      assertClipboardData('<!-- x-tinymce/html -->a<em>c</em>', 'ac');
      TinyAssertions.assertContent(editor, '<p>a<em>cd</em>e</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 1, 0 ], 1);
    });

    it('TBA: Copy collapsed selection', () => {
      const editor = hook.editor();
      copy(editor, '<p>abc</p>', [ 0, 0 ], 1, [ 0, 0 ], 1);
      assertClipboardData('', '');
      TinyAssertions.assertContent(editor, '<p>abc</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('TBA: Copy collapsed selection with table selection', () => {
      const editor = hook.editor();
      copy(editor,
        '<table data-mce-selected="1">' +
            '<tbody>' +
              '<tr>' +
                '<td data-mce-first-selected="1" data-mce-selected="1">a</td>' +
                '<td data-mce-last-selected="1" data-mce-selected="1">b</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>',
        [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0);
      assertClipboardData(
        '<!-- x-tinymce/html --><table>\n' +
            '<tbody>\n' +
              '<tr>\n' +
                '<td>a</td>\n' +
                '<td>b</td>\n' +
              '</tr>\n' +
            '</tbody>\n' +
          '</table>', 'ab');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0);
    });

    it('TINY-8563: Copy cef element', () => {
      const editor = hook.editor();
      copy(editor, '<p>a<span contenteditable="false">bc</span></p>', [ 0 ], 1, [ 0 ], 2);
      assertClipboardData('<!-- x-tinymce/html --><span contenteditable="false">bc</span>', 'bc');
      TinyAssertions.assertContent(editor, '<p>a<span contenteditable="false">bc</span></p>');
      TinyAssertions.assertSelection(editor, [ 0 ], 1, [ 0 ], 2);
    });
  });

  context('cut', () => {
    const pWaitUntilAssertContent = (editor: Editor, expected: string) =>
      Waiter.pTryUntil('Cut is async now, so need to wait for content', () => TinyAssertions.assertContent(editor, expected));

    it('TBA: Cut simple text', async () => {
      const editor = hook.editor();
      cut(editor, '<p>text</p>', [ 0, 0 ], 0, [ 0, 0 ], 4);
      assertClipboardData('<!-- x-tinymce/html -->text', 'text');
      await pWaitUntilAssertContent(editor, '');
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('TBA: Cut inline elements', async () => {
      const editor = hook.editor();
      cut(editor, '<p>te<em>x</em>t</p>', [ 0, 0 ], 0, [ 0, 2 ], 1);
      assertClipboardData('<!-- x-tinymce/html -->te<em>x</em>t', 'text');
      await pWaitUntilAssertContent(editor, '');
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('TBA: Cut partially selected inline elements', async () => {
      const editor = hook.editor();
      cut(editor, '<p>a<em>cd</em>e</p>', [ 0, 0 ], 0, [ 0, 1, 0 ], 1);
      assertClipboardData('<!-- x-tinymce/html -->a<em>c</em>', 'ac');
      await pWaitUntilAssertContent(editor, '<p><em>d</em>e</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 0);
    });

    it('TBA: Cut collapsed selection', async () => {
      const editor = hook.editor();
      cut(editor, '<p>abc</p>', [ 0, 0 ], 1, [ 0, 0 ], 1);
      assertClipboardData('', '');
      await pWaitUntilAssertContent(editor, '<p>abc</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });

    it('TINY-8563: Cut cef element', async () => {
      const editor = hook.editor();
      cut(editor, '<p>a<span contenteditable="false">bc</span></p>', [ 0 ], 1, [ 0 ], 2);
      assertClipboardData('<!-- x-tinymce/html --><span contenteditable="false">bc</span>', 'bc');
      await pWaitUntilAssertContent(editor, '<p>a</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });
  });

  context('paste', () => {
    const assertLastPreProcessEvent = (expectedData: { internal: boolean; content: string }) => {
      assert.equal(lastPreProcessEvent?.internal, expectedData.internal, 'Internal property should be equal');
      assert.equal(lastPreProcessEvent?.content, expectedData.content, 'Content property should be equal');
    };

    const assertLastPostProcessEvent = (expectedData: { internal: boolean; content: string }) => {
      assert.equal(lastPostProcessEvent?.internal, expectedData.internal, 'Internal property should be equal');
      assert.equal(lastPostProcessEvent?.node.innerHTML, expectedData.content, 'Content property should be equal');
    };

    const pWaitForProcessEvents = () => Waiter.pTryUntil('Did not get any events fired', () => {
      assert.isDefined(lastPreProcessEvent, 'PastePreProcess event object');
      assert.isDefined(lastPostProcessEvent, 'PastePostProcess event object');
    });

    it('TBA: Paste external content', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForProcessEvents();
      assertLastPreProcessEvent({ internal: false, content: 'X' });
      assertLastPostProcessEvent({ internal: false, content: 'X' });
    });

    it('TBA: Paste external content treated as plain text', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForProcessEvents();
      assertLastPreProcessEvent({ internal: false, content: 'X' });
      assertLastPostProcessEvent({ internal: false, content: 'X' });
    });

    it('TBA: Paste internal content with mark', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': InternalHtml.mark('<p>X</p>') }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForProcessEvents();
      assertLastPreProcessEvent({ internal: true, content: '<p>X</p>' });
      assertLastPostProcessEvent({ internal: true, content: '<p>X</p>' });
    });

    it('TBA: Paste internal content with mime', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>', 'x-tinymce/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForProcessEvents();
      assertLastPreProcessEvent({ internal: true, content: '<p>X</p>' });
      assertLastPostProcessEvent({ internal: true, content: '<p>X</p>' });
    });

    it('TINY-9489: uri-list should not be pasted in as a link', async () => {
      const editor = hook.editor();
      paste(editor, '<p>X</p>', { 'text/plain': 'https://tiny.com', 'text/uri-list': 'https://tiny.com' }, [ 0, 0 ], 0, [ 0, 0 ], 1);
      await pWaitForProcessEvents();
      assertLastPreProcessEvent({ internal: false, content: 'https://tiny.com' });
      assertLastPostProcessEvent({ internal: false, content: 'https://tiny.com' });
      TinyAssertions.assertContent(editor, '<p><a href="https://tiny.com">X</a></p>');
    });
  });
});
