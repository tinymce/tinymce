import { afterEach, before, context, describe, it } from '@ephox/bedrock-client';
import { Arr, Fun } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.models.dom.table.command.TableDeleteRowTest', () => {
  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('TableModified', logEvent);
    }
  }, [], true);

  afterEach(() => {
    events = [];
  });

  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  const assertEvents = (count: number) => {
    assert.lengthOf(events, count);
    Arr.each(events, (event) => {
      assert.equal(event.type, 'tablemodified', 'Event name');
      assert.isTrue(event.structure, 'Table modified structure');
      assert.isFalse(event.style, 'Table modified style');
    });
  };

  it('TINY-7916: Delete all rows should delete the table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 2, 0, 0 ], 1);

    editor.execCommand('mceTableDeleteRow');
    TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0, 0 ], 1);
    editor.execCommand('mceTableDeleteRow');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
    editor.execCommand('mceTableDeleteRow');
    TinyAssertions.assertContent(editor, '');
    assertEvents(2);
  });

  it('TINY-7916: Delete all rows with a contenteditable=false cell', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td contenteditable="false">1</td></tr><tr><td>2</td></tr><tr><td>3</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 2, 0, 0 ], 1);

    editor.execCommand('mceTableDeleteRow');
    TinyAssertions.assertCursor(editor, [ 0, 0, 1, 0, 0 ], 1);
    editor.execCommand('mceTableDeleteRow');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    editor.execCommand('mceTableDeleteRow');
    TinyAssertions.assertContent(editor, '');
    assertEvents(2);
  });

  it('TINY-9459: Should not apply mceTableDeleteRow command on table in noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const initalContent = '<table><tbody><tr><td>cell</td></tr></tbody></table>';
      editor.setContent(initalContent);
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      editor.execCommand('mceTableDeleteRow');
      TinyAssertions.assertContent(editor, initalContent);
    });
  });

  it('TINY-9459: Should not apply mceTableDeleteRow command on table in noneditable table', () => {
    const editor = hook.editor();
    const initalContent = '<table contenteditable="false"><tbody><tr><td>cell</td></tr></tbody></table>';
    editor.setContent(initalContent);
    TinySelections.setCursor(editor, [ 1, 0, 0, 0, 0 ], 0); // Index off by one due to cef fake caret
    editor.execCommand('mceTableDeleteRow');
    TinyAssertions.assertContent(editor, initalContent);
  });

  /** Create `rows` number of `tr` elements, with `cols` number of `td` elements inside each.  */
  const tr = (rows: number, cols: number): string[] =>
    Arr.range(rows, (r) => '<tr>' + Arr.range(cols, (c) => `<td>${r}-${c}</td>`).join('') + '</tr>');
  const textOffset = (row: number, col: number) => `${row}-${col}`.length;

  Arr.each([
    {
      rows: 4,
      cols: 3,
      options: {}
    },
    {
      rows: 4,
      cols: 3,
      options: { colgroup: true }
    },
    {
      rows: 20,
      cols: 20,
      options: {}
    },
    {
      rows: 20,
      cols: 20,
      options: { colgroup: true }
    }
  ], ({ rows, cols, options }) => {
    context(`${rows}x${cols} ${options.colgroup ? 'with colgroup' : ''}`, () => {
      const createTable = (tbody: string) => {
        const colgroup = options.colgroup ? `<colgroup>${Arr.range(cols, Fun.constant('<col>')).join('')}</colgroup>` : '';
        return `<table>${colgroup}<tbody>${tbody}</tbody></table>`;
      };
      const originalTBody = tr(rows, cols);
      const lastRowIndex = rows - 1;
      const pathToBody = [ 0, options.colgroup ? 1 : 0 ];

      before(() => {
        const editor = hook.editor();
        editor.setContent(createTable(originalTBody.join('')));
      });

      it('TINY-6309: Should place cursor in adjacent cell when deleting the last row', () => {
        const editor = hook.editor();
        TinySelections.setCursor(editor, [ ...pathToBody, lastRowIndex, 1, 0 ], 0);
        editor.execCommand('mceTableDeleteRow');
        TinyAssertions.assertCursor(editor, [ ...pathToBody, lastRowIndex - 1, 1, 0 ], textOffset(1, lastRowIndex - 1));
        TinyAssertions.assertContent(
          editor,
          createTable(originalTBody.slice(0, -1).join(''))
        );

        assertEvents(1);
      });

      it('TINY-6309: Should place cursor in adjacent cell when deleting the first row', () => {
        const editor = hook.editor();
        TinySelections.setCursor(editor, [ ...pathToBody, 0, 0, 0 ], 0);
        editor.execCommand('mceTableDeleteRow');
        TinyAssertions.assertCursor(editor, [ ...pathToBody, 0, 0, 0 ], textOffset(0, 0));
        TinyAssertions.assertContent(
          editor,
          createTable(originalTBody.slice(1, -1).join(''))
        );

        assertEvents(1);
      });
    });
  });
});
