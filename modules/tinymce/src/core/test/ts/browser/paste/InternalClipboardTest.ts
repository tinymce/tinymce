import { Clipboard, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Cell, Singleton } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { PastePostProcessEvent, PastePreProcessEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InternalHtml from 'tinymce/core/paste/InternalHtml';
import TablePlugin from 'tinymce/plugins/table/Plugin';

interface ProcessEventExpectedData {
  readonly internal: boolean;
  readonly content: string;
}

interface InputEventExpectedData {
  readonly data: string;
}

describe('browser.tinymce.core.paste.InternalClipboardTest', () => {
  const dataTransfer = Singleton.value<DataTransfer>();
  const lastPreProcessEvent = Singleton.value<EditorEvent<PastePreProcessEvent>>();
  const lastPostProcessEvent = Singleton.value<EditorEvent<PastePostProcessEvent>>();
  const lastInputEvent = Singleton.value<EditorEvent<InputEvent>>();

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    init_instance_callback: (editor: Editor) => {
      editor.on('PastePreProcess', (e) => {
        lastPreProcessEvent.set(e);
      });

      editor.on('PastePostProcess', (e) => {
        lastPostProcessEvent.set(e);
      });

      editor.on('input', (e) => {
        lastInputEvent.set(e);
      });

      editor.on('copy cut paste', (e) => {
        dataTransfer.set(e.clipboardData);
      });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ TablePlugin ]);

  const assertSingletonValueIsSet = <T>(singleton: Singleton.Value<T>, message: string) =>
    assert.isTrue(singleton.isSet(), message);

  const resetEventsAndDataTransfer = () => {
    lastPreProcessEvent.clear();
    lastPostProcessEvent.clear();
    lastInputEvent.clear();
    dataTransfer.clear();
  };

  const cutCopyDataTransferEvent = (editor: Editor, type: 'cut' | 'copy') => {
    const action = type === 'cut' ? Clipboard.cut : Clipboard.copy;
    action(TinyDom.body(editor));
  };

  const pasteDataTransferEvent = (editor: Editor, data: Record<string, string>) =>
    Clipboard.pasteItems(TinyDom.body(editor), data);

  const assertClipboardData = (expectedHtml: string, expectedText: string) => {
    assertSingletonValueIsSet(dataTransfer, 'dataTransfer should be defined');
    dataTransfer.on((transfer) => {
      assert.equal(transfer.getData('text/html'), expectedHtml, 'text/html data should match');
      assert.equal(transfer.getData('text/plain'), expectedText, 'text/plain data should match');
    });
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
    resetEventsAndDataTransfer();
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
    const assertLastPreProcessEvent = (expectedData: ProcessEventExpectedData) =>
      lastPreProcessEvent.on((e) => {
        assert.equal(e.internal, expectedData.internal, 'Internal property should be equal');
        assert.equal(e.content, expectedData.content, 'Content property should be equal');
      });

    const assertLastPostProcessEvent = (expectedData: ProcessEventExpectedData) =>
      lastPostProcessEvent.on((e) => {
        assert.equal(e.internal, expectedData.internal, 'Internal property should be equal');
        assert.equal(e.node.innerHTML, expectedData.content, 'Content property should be equal');
      });

    const pWaitFor = (message: string, waitFn: () => void) => Waiter.pTryUntil(message, waitFn, undefined, 100);

    const pWaitForProcessEvents = () =>
      pWaitFor('Did not fire process events', () => {
        assertSingletonValueIsSet(lastPreProcessEvent, 'PastePreProcess event has fired');
        assertSingletonValueIsSet(lastPostProcessEvent, 'PastePostProcess event has fired');
      });

    const pWaitForInputEvent = () =>
      pWaitFor('Did not fire input event', () => assertSingletonValueIsSet(lastInputEvent, 'Input event has fired'));

    const pWaitForAndAssertProcessEvents = async (expectedData: ProcessEventExpectedData): Promise<void> => {
      await pWaitForProcessEvents();
      assertLastPreProcessEvent(expectedData);
      assertLastPostProcessEvent(expectedData);
    };

    const pWaitForAndAssertInputEvent = async (expectedData: InputEventExpectedData): Promise<void> => {
      await pWaitForInputEvent();
      lastInputEvent.on((e) => {
        assert.equal(e.inputType, 'insertFromPaste', 'Input event type should be "insertFromPaste"');
        assert.equal(e.data, expectedData.data, 'Input event data should be as expected');
      });
    };

    const pWaitForAndAssertEvents = async (processExpected: ProcessEventExpectedData, inputExpected: InputEventExpectedData): Promise<void> => {
      await pWaitForAndAssertProcessEvents(processExpected);
      await pWaitForAndAssertInputEvent(inputExpected);
    };

    const pWaitForAndAssertNoEvents = async (): Promise<void> => {
      const thrown = Cell<boolean>(false);
      try {
        await Waiter.pTryUntilPredicate('Did not fire any paste event',
          () => lastPreProcessEvent.isSet() || lastPostProcessEvent.isSet() || lastPostProcessEvent.isSet());
      } catch {
        thrown.set(true);
      }
      assert.isTrue(thrown.get(), 'Should have no events after waiting');
    };

    it('TBA: Paste external content', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: false, content: 'X' }, { data: 'X' });
    });

    it('TBA: Paste external content treated as plain text', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: false, content: 'X' }, { data: 'X' });
    });

    it('TINY-9829: Paste external plain-text-only content', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: false, content: 'X' }, { data: 'X' });
    });

    it('TINY-9829: Paste external non-extractable content', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { xyz: 'Invalid' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertNoEvents();
    });

    it('TBA: Paste internal content with mark', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': InternalHtml.mark('<p>X</p>') }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: true, content: '<p>X</p>' }, { data: '<p>X</p>' });
    });

    it('TBA: Paste internal content with mime', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>', 'x-tinymce/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: true, content: '<p>X</p>' }, { data: '<p>X</p>' });
    });

    it('TINY-9489: uri-list should not be pasted in as a link', async () => {
      const editor = hook.editor();
      paste(editor, '<p>X</p>', { 'text/plain': 'https://tiny.com', 'text/uri-list': 'https://tiny.com' }, [ 0, 0 ], 0, [ 0, 0 ], 1);
      await pWaitForAndAssertEvents({ internal: false, content: 'https://tiny.com' }, { data: 'https://tiny.com' });
      TinyAssertions.assertContent(editor, '<p><a href="https://tiny.com">X</a></p>');
    });
  });
});
