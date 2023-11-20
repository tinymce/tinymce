import { afterEach, context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections, TinyState } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { TableModifiedEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

describe('browser.tinymce.models.dom.table.command.TableDeleteColumnTest', () => {
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

  it('TINY-7916: Delete all columns should delete the table', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td>1</td><td>2</td><td>3</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 2, 0 ], 1);

    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 0, 0 ], 1);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertContent(editor, '');
    assertEvents(2);
  });

  it('TINY-7916: Delete all columns with a contenteditable=false column', () => {
    const editor = hook.editor();
    editor.setContent('<table><tbody><tr><td contenteditable="false">1</td><td>2</td><td>3</td></tr></tbody></table>');
    TinySelections.setCursor(editor, [ 0, 0, 0, 2, 0 ], 1);

    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertCursor(editor, [ 0, 0, 0, 1, 0 ], 1);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertContent(editor, '');
    assertEvents(2);
  });

  it('TINY-9459: Should not apply mceTableDeleteCol command on table in noneditable root', () => {
    TinyState.withNoneditableRootEditor(hook.editor(), (editor) => {
      const initalContent = '<table><tbody><tr><td>cell</td></tr></tbody></table>';
      editor.setContent(initalContent);
      TinySelections.setCursor(editor, [ 0, 0, 0, 0, 0 ], 0);
      editor.execCommand('mceTableDeleteCol');
      TinyAssertions.assertContent(editor, initalContent);
    });
  });

  it('TINY-9459: Should not apply mceTableDeleteCol command on table in noneditable table', () => {
    const editor = hook.editor();
    const initalContent = '<table contenteditable="false"><tbody><tr><td>cell</td></tr></tbody></table>';
    editor.setContent(initalContent);
    TinySelections.setCursor(editor, [ 1, 0, 0, 0, 0 ], 0); // Index off by one due to cef fake caret
    editor.execCommand('mceTableDeleteCol');
    TinyAssertions.assertContent(editor, initalContent);
  });

  /** Create `rows` number of `tr` elements, with `cols` number of `td` elements inside each.  */
  const tr = (rows: number, cols: number): string[] =>
    Arr.range(rows, (r) => '<tr>' + Arr.range(cols, (c) => `<td>${r}-${c}</td>`).join('') + '</tr>');

  Arr.each([
    {
      label: 'no colgroup',
      pathToBody: [ 0, 0 ],
      createTable: (tbody: string) => `<table><tbody>${tbody}</tbody></table>`,
    },
    {
      label: 'with colgroup',
      pathToBody: [ 0, 1 ],
      createTable: (tbody: string) => `<table><colgroup><col><col><col><col></colgroup><tbody>${tbody}</tbody></table>`,
    }
  ], ({ label, pathToBody, createTable }) => {
    context(label, () => {
      it('TINY-6309: Should place cursor in adjacent cell when deleting the first and last column.', () => {
        const editor = hook.editor();
        const originalTBody = tr(3, 4);
        editor.setContent(createTable(originalTBody.join('')));

        // Delete last column:
        TinySelections.setCursor(editor, [ ...pathToBody, 1, 3, 0 ], 0);
        editor.execCommand('mceTableDeleteCol');
        TinyAssertions.assertCursor(editor, [ ...pathToBody, 1, 2, 0 ], 3);
        TinyAssertions.assertContent(
          editor,
          createTable(originalTBody.join('').replace(/<td>\d-3<\/td>/g, '')).replace('<col>', '')
        );

        // Delete first column:
        TinySelections.setCursor(editor, [ ...pathToBody, 1, 0, 0 ], 0);
        editor.execCommand('mceTableDeleteCol');
        TinyAssertions.assertCursor(editor, [ ...pathToBody, 1, 0, 0 ], 3);
        TinyAssertions.assertContent(
          editor,
          createTable(originalTBody.join('').replace(/<td>\d-[03]<\/td>/g, '')).replace('<col><col>', '')
        );

        assertEvents(2);
      });
    });
  });
});
