import { Clipboard, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import * as InternalHtml from 'tinymce/plugins/paste/core/InternalHtml';
import PastePlugin from 'tinymce/plugins/paste/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.paste.InternalClipboardTest', () => {
  const browser = PlatformDetection.detect().browser;
  let dataTransfer, lastPreProcessEvent, lastPostProcessEvent;

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'paste table',
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
  }, [ PastePlugin, TablePlugin, Theme ]);

  const resetProcessEvents = () => {
    lastPreProcessEvent = null;
    lastPostProcessEvent = null;
  };

  const cutCopyDataTransferEvent = (editor: Editor, type: 'cut' | 'copy') => {
    const action = type === 'cut' ? Clipboard.cut : Clipboard.copy;
    action(TinyDom.body(editor));
  };

  const pasteDataTransferEvent = (editor: Editor, data: Record<string, string>) =>
    Clipboard.pasteItems(TinyDom.body(editor), data);

  const assertClipboardData = (expectedHtml: string, expectedText: string) => {
    assert.equal(dataTransfer.getData('text/html'), expectedHtml, 'text/html data should match');
    assert.equal(dataTransfer.getData('text/plain'), expectedText, 'text/plain data should match');
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
    resetProcessEvents();
    pasteDataTransferEvent(editor, pasteData);
  };

  context('copy', () => {
    it('TBA: Copy simple text', () => {
      const editor = hook.editor();
      copy(editor, '<p>text</p>', [ 0, 0 ], 0, [ 0, 0 ], 4);
      assertClipboardData('text', 'text');
      TinyAssertions.assertContent(editor, '<p>text</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    });

    it('TBA: Copy inline elements', () => {
      const editor = hook.editor();
      copy(editor, '<p>te<em>x</em>t</p>', [ 0, 0 ], 0, [ 0, 2 ], 1);
      assertClipboardData('te<em>x</em>t', 'text');
      TinyAssertions.assertContent(editor, '<p>te<em>x</em>t</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 0, [ 0, 2 ], 1);
    });

    it('TBA: Copy partially selected inline elements', () => {
      const editor = hook.editor();
      copy(editor, '<p>a<em>cd</em>e</p>', [ 0, 0 ], 0, [ 0, 1, 0 ], 1);
      assertClipboardData('a<em>c</em>', 'ac');
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
        '<table>\n' +
            '<tbody>\n' +
              '<tr>\n' +
                '<td>a</td>\n' +
                '<td>b</td>\n' +
              '</tr>\n' +
            '</tbody>\n' +
          '</table>', 'ab');
      TinyAssertions.assertSelection(editor, [ 0, 0, 0, 1, 0 ], 0, [ 0, 0, 0, 1, 0 ], 0);
    });
  });

  context('cut', () => {
    const pWaitUntilAssertContent = (editor: Editor, expected: string) =>
      Waiter.pTryUntil('Cut is async now, so need to wait for content', () => TinyAssertions.assertContent(editor, expected));

    it('TBA: Cut simple text', async () => {
      const editor = hook.editor();
      cut(editor, '<p>text</p>', [ 0, 0 ], 0, [ 0, 0 ], 4);
      assertClipboardData('text', 'text');
      await pWaitUntilAssertContent(editor, '');
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('TBA: Cut inline elements', async () => {
      const editor = hook.editor();
      cut(editor, '<p>te<em>x</em>t</p>', [ 0, 0 ], 0, [ 0, 2 ], 1);
      assertClipboardData('te<em>x</em>t', 'text');
      await pWaitUntilAssertContent(editor, '');
      TinyAssertions.assertSelection(editor, [ 0 ], 0, [ 0 ], 0);
    });

    it('TBA: Cut partially selected inline elements', async () => {
      const editor = hook.editor();
      cut(editor, '<p>a<em>cd</em>e</p>', [ 0, 0 ], 0, [ 0, 1, 0 ], 1);
      assertClipboardData('a<em>c</em>', 'ac');
      await pWaitUntilAssertContent(editor, '<p><em>d</em>e</p>');
      // TODO: Investigate why Edge ends up with a different selection here
      TinyAssertions.assertSelection(editor, browser.isEdge() ? [ 0 ] : [ 0, 0, 0 ], 0, browser.isEdge() ? [ 0 ] : [ 0, 0, 0 ], 0);
    });

    it('TBA: Cut collapsed selection', async () => {
      const editor = hook.editor();
      cut(editor, '<p>abc</p>', [ 0, 0 ], 1, [ 0, 0 ], 1);
      assertClipboardData('', '');
      await pWaitUntilAssertContent(editor, '<p>abc</p>');
      TinyAssertions.assertSelection(editor, [ 0, 0 ], 1, [ 0, 0 ], 1);
    });
  });

  context('paste', () => {
    const assertLastPreProcessEvent = (expectedData: { internal: boolean; content: string }) => {
      assert.equal(lastPreProcessEvent.internal, expectedData.internal, 'Internal property should be equal');
      assert.equal(lastPreProcessEvent.content, expectedData.content, 'Content property should be equal');
    };

    const assertLastPostProcessEvent = (expectedData: { internal: boolean; content: string }) => {
      assert.equal(lastPostProcessEvent.internal, expectedData.internal, 'Internal property should be equal');
      assert.equal(lastPostProcessEvent.node.innerHTML, expectedData.content, 'Content property should be equal');
    };

    const pWaitForProcessEvents = () => Waiter.pTryUntil('Did not get any events fired', () => {
      assert.isNotNull(lastPreProcessEvent, 'PastePreProcess event object');
      assert.isNotNull(lastPostProcessEvent, 'PastePostProcess event object');
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
  });
});
