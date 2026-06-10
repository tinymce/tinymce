import { ApproxStructure, Clipboard, Waiter, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { Attribute } from '@ephox/sugar';
import { TinyAssertions, TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import type Editor from 'tinymce/core/api/Editor';
import type { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';

describe('browser.tinymce.core.ReadOnlyModeContentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    toolbar: 'bold',
    indent: false,
    statusbar: false,
  }, [], true);

  const setMode = (editor: Editor, mode: string) => {
    editor.mode.set(mode);
  };

  const assertFakeSelection = (editor: Editor, expectedState: boolean) => {
    assert.equal(editor.selection.getNode().hasAttribute('data-mce-selected'), expectedState, 'Selected element should have expected state');
  };

  const tableOfContentHtml = `<div class="mce-toc" contenteditable="false">
      <h2 contenteditable="true">Table of Contents</h2>
      <ul>
      <li><a href="#mcetoc_">Heading</a></li>
      </ul>
      </div>`;

  const copy = (editor: Editor, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    TinySelections.setSelection(editor, spath, soffset, fpath, foffset);
    Clipboard.copy(TinyDom.body(editor));
  };

  const paste = (editor: Editor, pasteData: Record<string, string>, spath: number[], soffset: number, fpath: number[], foffset: number) => {
    TinySelections.setSelection(editor, spath, soffset, fpath, foffset);
    editor.undoManager.add(); // Undo level would not always be properly created in some situations, so we create it manually to prevent tests from failing when they shouldn't.
    pasteDataTransferEvent(editor, pasteData);
  };

  const pasteDataTransferEvent = (editor: Editor, data: Record<string, string>) =>
    Clipboard.pasteItems(TinyDom.body(editor), data);

  const fakeBackspaceKeyOnRange = (editor: Editor) => {
    editor.execCommand('Delete');
    TinyContentActions.keyup(editor, Keys.backspace());
  };

  it('TINY-10981: Allow selection of contenteditable="false" elements in readonly mode', () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<div contenteditable="false">CEF</div>');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'div[contenteditable="false"]', []);
    assertFakeSelection(editor, true);
  });

  it('TINY-10981: Deleting text should not be permitted', async () => {
    const editor = hook.editor();
    editor.setContent('<p>test</p>');

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);
    fakeBackspaceKeyOnRange(editor);
    TinyAssertions.assertContent(editor, '<p>tes</p>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    fakeBackspaceKeyOnRange(editor);
    TinyAssertions.assertContent(editor, '<p>tes</p>');

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 3);
    fakeBackspaceKeyOnRange(editor);
    TinyAssertions.assertContent(editor, '<p>te</p>');
  });

  it('TINY-10981: Allow selection of div element (tableofcontents) in readonly mode', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent(tableOfContentHtml);
    TinySelections.select(editor, 'div', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'div', []);
    assertFakeSelection(editor, true);

    setMode(editor, 'design');
    TinySelections.select(editor, 'div', []);
    assertFakeSelection(editor, true);
  });

  it('TINY-10981: Deleting div element (tableofcontents) block should not be permitted', async () => {
    const editor = hook.editor();
    editor.setContent(tableOfContentHtml);

    setMode(editor, 'readonly');
    TinySelections.select(editor, 'div', []);
    assertFakeSelection(editor, true);
    fakeBackspaceKeyOnRange(editor);
    TinyAssertions.assertContent(editor, [
      '<div class="mce-toc" contenteditable="false">',
      '<h2 contenteditable="true">Table of Contents</h2>',
      '<ul>',
      '<li><a href="#mcetoc_">Heading</a></li>',
      '</ul>',
      '</div>'
    ].join(''));

    setMode(editor, 'design');
    TinySelections.select(editor, 'div', []);
    assertFakeSelection(editor, true);
    TinyContentActions.keystroke(editor, Keys.backspace());
    TinyAssertions.assertContent(editor, '');
  });

  it('TINY-10981: Allow cursor to be placed into the editor', () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<p>test test</p>');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 5);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 5);

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 5);
  });

  it('TINY-10981: Allow expanding text selection', () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<p>hello there</p>');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);

    setMode(editor, 'readonly');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);

    setMode(editor, 'design');
    TinySelections.setSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);
    TinyAssertions.assertSelection(editor, [ 0, 0 ], 5, [ 0, 0 ], 10);
  });

  it('TINY-10981: Keydown events should be blocked when the cursor is in the editor', async () => {
    const editor = hook.editor();
    editor.setContent('<p>hello there</p>');

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    editor.insertContent('A');
    editor.dispatch('input');
    await Waiter.pWait(50);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    editor.insertContent('A');
    editor.dispatch('input');
    await Waiter.pWait(50);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 5);

    setMode(editor, 'design');
    TinySelections.setCursor(editor, [ 0, 0 ], 5);
    editor.insertContent('A');
    editor.dispatch('input');
    await Waiter.pWait(50);
    TinyAssertions.assertCursor(editor, [ 0, 0 ], 6);
    TinyAssertions.assertContent(editor, '<p>helloAA there</p>');
  });

  it('TINY-10981: Pasting should be blocked when the cursor is in the editor', async () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<p>test</p>');
    paste(editor, { 'text/html': '<p>X</p>' }, [ 0, 0 ], 4, [ 0, 0 ], 4);
    TinyAssertions.assertContent(editor, '<p>testX</p>');

    setMode(editor, 'readonly');
    paste(editor, { 'text/html': '<p>X</p>' }, [ 0, 0 ], 5, [ 0, 0 ], 5);
    TinyAssertions.assertContent(editor, '<p>testX</p>');

    setMode(editor, 'design');
    paste(editor, { 'text/html': '<p>X</p>' }, [ 0, 0 ], 5, [ 0, 0 ], 5);
    TinyAssertions.assertContent(editor, '<p>testXX</p>');
  });

  it('TINY-10981: Copying should be permitted when the cursor is in the editor', async () => {
    const editor = hook.editor();
    const assertClipboardData = (expectedHtml: string, expectedText: string) => {
      assert.isTrue(dataTransfer.isSet(), 'dataTransfer should be set');
      dataTransfer.on((transfer) => {
        assert.equal(transfer.getData('text/html'), expectedHtml, 'text/html data should match');
        assert.equal(transfer.getData('text/plain'), expectedText, 'text/plain data should match');
      });
    };

    const dataTransfer = Singleton.value<DataTransfer>();
    const copyHandler = (e: EditorEvent<ClipboardEvent>) => {
      if (e.clipboardData) {
        dataTransfer.set(e.clipboardData);
      }
    };
    editor.on('copy', copyHandler);

    editor.setContent('<p>test</p>');
    setMode(editor, 'readonly');
    copy(editor, [ 0, 0 ], 0, [ 0, 0 ], 4);
    assertClipboardData('<!-- x-tinymce/html -->test', 'test');
    paste(editor, { 'text/html': '<p>X</p>' }, [ 0, 0 ], 4, [ 0, 0 ], 4);
    TinyAssertions.assertContent(editor, '<p>test</p>');
    editor.off('copy', copyHandler);
    setMode(editor, 'design');
  });

  it('TINY-10981: Setting caret before cef in editor while in readonly mode should render fake caret', () => {
    const editor = hook.editor();

    setMode(editor, 'design');
    editor.setContent('<div contenteditable="false">CEF</div>');

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [], 0);
    const expectedStructure = ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: [
          s.element('p', {
            attrs: {
              'data-mce-caret': str.is('before'),
              'data-mce-bogus': str.is('all')
            },
            children: [
              s.element('br', {})
            ]
          }),
          s.element('div', {
            attrs: {
              contenteditable: str.is('false')
            },
            children: [
              s.text(str.is('CEF'))
            ]
          }),
          s.element('div', {
            attrs: {
              'data-mce-bogus': str.is('all')
            },
            classes: [ arr.has('mce-visual-caret'), arr.has('mce-visual-caret-before') ]
          })
        ]
      });
    });
    TinyAssertions.assertContentStructure(editor, expectedStructure);

    setMode(editor, 'design');
    TinyAssertions.assertContentStructure(editor, expectedStructure);
  });

  const assertRangeInCaretContainerBlock = (editor: Editor) =>
    assert.isTrue(CaretContainer.isRangeInCaretContainerBlock(editor.selection.getRng()));

  it('TINY-10981: Moving cursor around div element (tableofcontents) block', () => {
    const editor = hook.editor();
    editor.setContent(`<p>test</p>${tableOfContentHtml}`);

    setMode(editor, 'readonly');
    TinySelections.setCursor(editor, [ 0, 0 ], 4);

    TinyContentActions.keystroke(editor, Keys.right());
    assertRangeInCaretContainerBlock(editor);

    TinyContentActions.keystroke(editor, Keys.right());
    assertFakeSelection(editor, true);

    TinyContentActions.keystroke(editor, Keys.right());
    assertRangeInCaretContainerBlock(editor);
    setMode(hook.editor(), 'design');
  });

  it('TINY-10981: Checking content editable attribute of editor body', () => {
    const editor = hook.editor();
    const body = TinyDom.body(editor);
    assert.equal(Attribute.get(body, 'contenteditable'), 'true');
    setMode(editor, 'readonly');
    assert.equal(Attribute.get(body, 'contenteditable'), 'true');
    setMode(editor, 'design');
    assert.equal(Attribute.get(body, 'contenteditable'), 'true');
  });
});
