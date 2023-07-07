import { Mouse, UiFinder } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const enum Direction {
  Row,
  Column
}

describe('browser.tinymce.models.dom.table.TwoCellsSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    base_url: '/project/tinymce/js/tinymce',
  }, []);

  const setup = (editor: Editor, colgroup: boolean, direction: Direction) => {
    editor.setContent(
      '<table>' +
      (colgroup ? '<colgroup><col /><col /><col /></colgroup>' : '') +
      '<tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td></tr>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td></tr>' +
      '</tbody>' +
      '</table>'
    );
    const path = colgroup ? [ 0, 1, 1, 1, 0 ] : [ 0, 0, 1, 1, 0 ];
    TinySelections.setCursor(editor, path, 1);
    const startCell = UiFinder.findIn(TinyDom.body(editor), 'td:contains(B2)').getOrDie();
    const endCellSelector = direction === Direction.Column ? 'td:contains(B1)' : 'td:contains(A2)';
    const endCell = UiFinder.findIn(TinyDom.body(editor), endCellSelector).getOrDie();

    // Drag over the 2 cells to select them
    Mouse.mouseOver(startCell);
    Mouse.mouseDown(startCell);

    // Note: This additional mouseover is here to trigger/test the same cell checks in MouseSelection.ts
    Mouse.mouseOver(startCell);

    Mouse.mouseOver(endCell);
    Mouse.mouseUp(endCell);
  };

  it('TINY-3897: Selecting 2 cells via the mouse should only have 1 range selection', () => {
    const editor = hook.editor();
    setup(editor, true, Direction.Row);
    TinyAssertions.assertContentPresence(editor, {
      'td[data-mce-selected]': 2
    });
    assert.equal(editor.selection.getSel()?.rangeCount, 1, 'there should only be 1 selection range');
  });

  it('TINY-3897: Select 2 cells in same row via mouse and merge them together', () => {
    const editor = hook.editor();
    setup(editor, true, Direction.Row);
    editor.execCommand('mceTableMergeCells');
    TinyAssertions.assertContent(editor,
      '<table>' +
      '<colgroup><col><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td></tr>' +
      '<tr><td colspan="2">A2<br>B2</td><td>C2</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-3897: Select 2 cells in same column via mouse and merge them together', () => {
    const editor = hook.editor();
    setup(editor, true, Direction.Column);
    editor.execCommand('mceTableMergeCells');
    TinyAssertions.assertContent(editor,
      '<table>' +
      '<colgroup><col><col><col></colgroup>' +
      '<tbody>' +
      '<tr><td>A1</td><td rowspan="2">B1<br>B2</td><td>C1</td></tr>' +
      '<tr><td>A2</td><td>C2</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6667: Select 2 cells in same row via mouse and change to header', () => {
    const editor = hook.editor();
    setup(editor, false, Direction.Row);
    editor.execCommand('mceTableRowType', false, { type: 'header' });
    TinyAssertions.assertContent(editor,
      '<table>' +
      '<thead>' +
      '<tr><td>A2</td><td>B2</td><td>C2</td></tr>' +
      '</thead>' +
      '<tbody>' +
      '<tr><td>A1</td><td>B1</td><td>C1</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  it('TINY-6667: Select 2 cells in same column via mouse and change to header', () => {
    const editor = hook.editor();
    setup(editor, false, Direction.Column);
    editor.execCommand('mceTableColType', false, { type: 'th' });
    TinyAssertions.assertContent(editor,
      '<table>' +
      '<tbody>' +
      '<tr><td>A1</td><th scope="row">B1</th><td>C1</td></tr>' +
      '<tr><td>A2</td><th scope="row">B2</th><td>C2</td></tr>' +
      '</tbody>' +
      '</table>'
    );
  });

  context('TINY-9952: 2 rows selection', () => {
    const platform = PlatformDetection.detect();

    it('TINY-9952: selecting 2 rows via mouse should set the correct range', () => {
      const editor = hook.editor();
      editor.setContent(
        '<table>' +
        '<tbody>' +
        '<tr><td>A1</td></tr>' +
        '<tr><td>A2</td></tr>' +
        '</tbody>' +
        '</table>'
      );
      TinySelections.setCursor(editor, [ 0, 0, 0, 0 ], 0);
      const startCell = UiFinder.findIn(TinyDom.body(editor), 'td:contains(A1)').getOrDie();
      const endCell = UiFinder.findIn(TinyDom.body(editor), 'td:contains(A2)').getOrDie();

      Mouse.mouseOver(startCell);
      Mouse.mouseDown(startCell);
      Mouse.mouseOver(startCell);
      Mouse.mouseOver(endCell);
      Mouse.mouseUp(endCell);

      // this difference is caused because mouse selection on tables using the native setting for ranges
      if (!platform.browser.isSafari()) {
        TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0 ], 1);
      } else {
        TinyAssertions.assertSelection(editor, [ 0, 0, 0, 0, 0 ], 0, [ 0, 0, 1, 0, 0 ], 'A2'.length);
      }
    });
  });
});
