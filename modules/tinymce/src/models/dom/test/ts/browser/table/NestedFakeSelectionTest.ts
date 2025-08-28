import { Cursors, Keys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Attribute } from '@ephox/sugar';
import { TinyDom, TinyHooks } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

import * as TableTestUtils from '../../module/table/TableTestUtils';

interface Scenario {
  readonly content: string;
  readonly selection: Cursors.CursorPath;
  readonly expectedSelectedCells: string[];
  readonly keyDirection: number;
}

describe('browser.tinymce.models.dom.table.NestedFakeSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, []);

  const basicNestedTable =
  '<table>' +
    '<tbody>' +
      '<tr>' +
        '<td data-cell="1a">' +
          '<p>abc</p>' +
          '<table>' +
            '<tbody>' +
              '<tr>' +
                '<td data-cell="2a">nested1</td>' +
                '<td data-cell="2b">nested2</td>' +
              '</tr>' +
            '</tbody>' +
          '</table>' +
          '<p>def</p>' +
        '</td>' +
      '</tr>' +
    '</tbody>' +
  '</table>';

  const assertMouseTableSelection = (editor: Editor, content: string, selection: Cursors.CursorPath, expectedSelectedCells: string[]) => {
    editor.setContent(content);
    const cursorRange = Cursors.calculate(TinyDom.body(editor), selection);
    TableTestUtils.selectWithMouse(cursorRange.start, cursorRange.finish);
    TableTestUtils.assertSelectedCells(editor, expectedSelectedCells, (cell) => Attribute.get(cell, 'data-cell'));
  };

  const assertKeyboardTableSelection = (editor: Editor, content: string, selection: Cursors.CursorPath, direction: number, expectedSelectedCells: string[]) => {
    editor.setContent(content);
    TableTestUtils.selectWithKeyboard(editor, selection, direction);
    TableTestUtils.assertSelectedCells(editor, expectedSelectedCells, (cell) => Attribute.get(cell, 'data-cell'));
  };

  const assertTableSelection = (editor: Editor, scenario: Scenario) => {
    assertMouseTableSelection(editor, scenario.content, scenario.selection, scenario.expectedSelectedCells);
    assertKeyboardTableSelection(editor, scenario.content, scenario.selection, scenario.keyDirection, scenario.expectedSelectedCells);
  };

  it('TINY-6298: Partially selecting cell content in the nested table', () => {
    const editor = hook.editor();

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content: basicNestedTable,
        selection: {
          startPath: [ ...firstTableCell, 1, 0, 0, 0, 0 ],
          soffset: 0,
          finishPath: [ ...firstTableCell, 1, 0, 0, 0, 0 ],
          foffset: 3,
        },
        expectedSelectedCells: [],
        keyDirection: Keys.right()
      }
    );
  });

  it('TINY-6298: Partially selecting cell content in outer table', () => {
    const editor = hook.editor();

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content: basicNestedTable,
        selection: {
          startPath: [ ...firstTableCell, 0, 0 ],
          soffset: 1,
          finishPath: [ ...firstTableCell, 0, 0 ],
          foffset: 3,
        },
        expectedSelectedCells: [],
        keyDirection: Keys.right()
      }
    );
  });

  it('TINY-6298: Partially selecting cell content in outer table that includes nested table in selection', () => {
    const editor = hook.editor();

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content: basicNestedTable,
        selection: {
          startPath: [ ...firstTableCell, 0, 0 ],
          soffset: 1,
          finishPath: [ ...firstTableCell, 2, 0 ],
          foffset: 2,
        },
        expectedSelectedCells: [],
        keyDirection: Keys.right()
      }
    );
  });

  it('TINY-6298: Selecting cells in the nested table', () => {
    const editor = hook.editor();

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content: basicNestedTable,
        selection: {
          startPath: [ ...firstTableCell, 1, 0, 0, 0, 0 ],
          soffset: 0,
          finishPath: [ ...firstTableCell, 1, 0, 0, 1, 0 ],
          foffset: 3,
        },
        expectedSelectedCells: [ '2a', '2b' ],
        keyDirection: Keys.right()
      }
    );
  });

  it('TINY-6298: Selecting cells in the outer table', () => {
    const editor = hook.editor();
    const content = (
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td data-cell="1a">' +
              '<p>abc</p>' +
              '<table>' +
                '<tbody>' +
                  '<tr>' +
                    '<td data-cell="2a">nested1</td>' +
                    '<td data-cell="2b">nested2</td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>' +
              '<p>def</p>' +
            '</td>' +
          '</tr>' +
          '<tr>' +
            '<td data-cell="1b">1b</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );

    assertTableSelection(
      editor,
      {
        content,
        selection: {
          startPath: [ 0, 0, 0, 0, 0, 0 ],
          soffset: 1,
          finishPath: [ 0, 0, 1, 0, 0 ],
          foffset: 1,
        },
        expectedSelectedCells: [ '1a', '1b' ],
        keyDirection: Keys.right()
      }
    );
  });

  it('TINY-6298: Selecting from outer table cell to the nested table cell in the same outer table cell', () => {
    const editor = hook.editor();

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content: basicNestedTable,
        selection: {
          startPath: [ ...firstTableCell, 0, 0 ],
          soffset: 1,
          finishPath: [ ...firstTableCell, 1, 0, 0, 1, 0 ],
          foffset: 3,
        },
        expectedSelectedCells: [],
        keyDirection: Keys.right()
      }
    );
  });

  it('TINY-6298: Selecting from nested table cell to the parent outer table cell', () => {
    const editor = hook.editor();

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content: basicNestedTable,
        selection: {
          startPath: [ ...firstTableCell, 1, 0, 0, 0, 0 ],
          soffset: 1,
          finishPath: [ ...firstTableCell, 2, 0 ],
          foffset: 1,
        },
        expectedSelectedCells: [],
        keyDirection: Keys.right()
      }
    );
  });

  it('TINY-6298: Selecting from outer table cell to a nested table cell not in the same outer table cell', () => {
    const editor = hook.editor();
    const content = (
      '<table>' +
        '<tbody>' +
          '<tr>' +
            '<td data-cell="1a">1a</td>' +
          '</tr>' +
          '<tr>' +
            '<td data-cell="1b">' +
              '<p>abc</p>' +
              '<table>' +
                '<tbody>' +
                  '<tr>' +
                    '<td data-cell="2a">nested1</td>' +
                    '<td data-cell="2b">nested2</td>' +
                  '</tr>' +
                '</tbody>' +
              '</table>' +
              '<p>def</p>' +
            '</td>' +
          '</tr>' +
        '</tbody>' +
      '</table>'
    );

    assertTableSelection(
      editor,
      {
        content,
        selection: {
          startPath: [ 0, 0, 0, 0, 0 ],
          soffset: 1,
          finishPath: [ 0, 0, 1, 0, 1, 0, 0, 0, 0 ],
          foffset: 3,
        },
        expectedSelectedCells: [ '1a', '1b' ],
        keyDirection: Keys.right()
      }
    );
  });

  it('TINY-6298: Selecting from outside paragraph to the nested table cell', () => {
    const editor = hook.editor();
    const content =
      '<p>outside paragraph</p>' +
      basicNestedTable;

    assertTableSelection(
      editor,
      {
        content,
        selection: {
          startPath: [ 0, 0 ],
          soffset: 1,
          finishPath: [ 1, 0, 0, 0, 1, 0, 0, 0, 0 ],
          foffset: 2,
        },
        expectedSelectedCells: [],
        keyDirection: Keys.right()
      }
    );
  });
});
