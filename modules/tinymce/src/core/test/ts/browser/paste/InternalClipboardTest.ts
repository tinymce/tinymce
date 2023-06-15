import { Clipboard, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { PastePostProcessEvent, PastePreProcessEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as InternalHtml from 'tinymce/core/paste/InternalHtml';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import * as PasteEventUtils from '../../module/test/PasteEventUtils';
import * as SingletonUtils from '../../module/test/SingletonUtils';

describe('browser.tinymce.core.paste.InternalClipboardTest', () => {
  const dataTransfer = Singleton.value<DataTransfer>();
  const lastPreProcessEvent = Singleton.value<EditorEvent<PastePreProcessEvent>>();
  const lastPostProcessEvent = Singleton.value<EditorEvent<PastePostProcessEvent>>();
  const lastBeforeInputEvent = Singleton.value<EditorEvent<InputEvent>>();
  const lastInputEvent = Singleton.value<EditorEvent<InputEvent>>();
  let eventTypes: string[] = [];
  const setEventSingletonAndAddType = <T>(singleton: Singleton.Value<EditorEvent<T>>, event: EditorEvent<T>): void => {
    singleton.set(event);
    eventTypes.push(event.type);
  };

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    setup: (editor: Editor) => {
      editor.on('PastePreProcess', (e) => setEventSingletonAndAddType(lastPreProcessEvent, e));
      editor.on('PastePostProcess', (e) => setEventSingletonAndAddType(lastPostProcessEvent, e));
      editor.on('beforeinput input', (e) => {
        // TINY-9829: Only care about input events related to paste. When pasted content replaces some
        // existing content in the editor, a `deleteContentBackward` input event is fired which is irrelevant
        if (e.inputType === 'insertFromPaste') {
          setEventSingletonAndAddType(e.type === 'beforeinput' ? lastBeforeInputEvent : lastInputEvent, e);
        }
      });
      editor.on('paste', (e) => eventTypes.push(e.type));
      editor.on('copy cut paste', (e) => dataTransfer.set(e.clipboardData));
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ TablePlugin ]);

  const resetEventsAndDataTransfer = () => {
    lastPreProcessEvent.clear();
    lastPostProcessEvent.clear();
    lastBeforeInputEvent.clear();
    lastInputEvent.clear();
    dataTransfer.clear();
    eventTypes = [];
  };

  const cutCopyDataTransferEvent = (editor: Editor, type: 'cut' | 'copy') => {
    const action = type === 'cut' ? Clipboard.cut : Clipboard.copy;
    action(TinyDom.body(editor));
  };

  const pasteDataTransferEvent = (editor: Editor, data: Record<string, string>) =>
    Clipboard.pasteItems(TinyDom.body(editor), data);

  const assertClipboardData = (expectedHtml: string, expectedText: string) => {
    SingletonUtils.assertSingletonValueIsSet(dataTransfer, 'dataTransfer should be defined');
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
    const pWaitForAndAssertEvents = async (processExpectedData: PasteEventUtils.ProcessEventExpectedData, beforeinputExpectedDataTransferHtml: string): Promise<void> => {
      await PasteEventUtils.pWaitForAndAssertProcessEvents(lastPreProcessEvent, lastPostProcessEvent, processExpectedData);
      await PasteEventUtils.pWaitForAndAssertInputEvents(lastBeforeInputEvent, lastInputEvent, beforeinputExpectedDataTransferHtml);
      assert.deepEqual(eventTypes, [ 'paste', 'pastepreprocess', 'pastepostprocess', 'beforeinput', 'input' ], 'Paste events should be fired in correct order');
    };

    const pWaitForAndAssertNoEvents = () => PasteEventUtils.pWaitForAndAssertEventsDoNotFire([ lastPreProcessEvent, lastPostProcessEvent, lastInputEvent ]);

    it('TBA: Paste external content', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: false, content: 'X' }, 'X');
    });

    it('TBA: Paste external content treated as plain text', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: false, content: 'X' }, 'X');
    });

    it('TINY-9829: Paste external non-extractable content', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { xyz: 'Invalid' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertNoEvents();
    });

    it('TBA: Paste internal content with mark', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': InternalHtml.mark('<p>X</p>') }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: true, content: '<p>X</p>' }, '<p>X</p>');
    });

    it('TBA: Paste internal content with mime', async () => {
      const editor = hook.editor();
      paste(editor, '<p>abc</p>', { 'text/plain': 'X', 'text/html': '<p>X</p>', 'x-tinymce/html': '<p>X</p>' }, [ 0, 0 ], 0, [ 0, 0 ], 3);
      await pWaitForAndAssertEvents({ internal: true, content: '<p>X</p>' }, '<p>X</p>');
    });

    it('TINY-9489: uri-list should not be pasted in as a link', async () => {
      const editor = hook.editor();
      paste(editor, '<p>X</p>', { 'text/plain': 'https://tiny.com', 'text/uri-list': 'https://tiny.com' }, [ 0, 0 ], 0, [ 0, 0 ], 1);
      await pWaitForAndAssertEvents({ internal: false, content: 'https://tiny.com' }, 'https://tiny.com');
      TinyAssertions.assertContent(editor, '<p><a href="https://tiny.com">X</a></p>');
    });
  });
});
