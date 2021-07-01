import { Cursors, Keys, Mouse } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { TinyContentActions, TinyDom, TinyHooks, TinySelections } from '@ephox/mcagar';
import { Attribute, SelectorFilter, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

interface Scenario {
  readonly content: string;
  readonly selection: Cursors.CursorPath;
  readonly expectedSelectedCells: string[];
  readonly keyDirection: number;
}

describe('browser.tinymce.plugins.table.NestedFakeSelectionTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'width,height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  // The critical part is the target element as this is what Darwin (MouseSelection.ts) uses to determine the fake selection
  const selectWithMouse = (start: SugarElement<Element>, end: SugarElement<Element>) => {
    Mouse.mouseDown(start, { button: 0 });
    Mouse.mouseOver(end, { button: 0 });
    Mouse.mouseUp(end, { button: 0 });
  };

  // Set up to mock what the listeners are looking for in InputHandlers.ts - keyup()
  const selectWithKeyboard = (editor: Editor, cursorRange: Cursors.CursorPath, direction: number) => {
    const { startPath, soffset, finishPath, foffset } = cursorRange;
    TinySelections.setSelection(editor, startPath, soffset, finishPath, foffset);
    TinyContentActions.keydown(editor, direction, { shiftKey: true });
    TinyContentActions.keyup(editor, direction, { shiftKey: true });
  };

  const getSelectedCells = (editor: Editor) =>
    SelectorFilter.descendants(TinyDom.body(editor), 'td[data-mce-selected],th[data-mce-selected]');

  const assertSelectedCells = (editor: Editor, expectedSelectedCells: string[]) => {
    const selectedCells = Arr.map(getSelectedCells(editor), (cell) => Attribute.get(cell, 'data-cell'));
    assert.deepEqual(selectedCells, expectedSelectedCells);
  };

  const assertMouseTableSelection = (editor: Editor, content: string, selection: Cursors.CursorPath, expectedSelectedCells: string[]) => {
    editor.setContent(content);
    const cursorRange = Cursors.calculate(TinyDom.body(editor), selection);
    selectWithMouse(cursorRange.start, cursorRange.finish);
    assertSelectedCells(editor, expectedSelectedCells);
  };

  const assertKeyboardTableSelection = (editor: Editor, content: string, selection: Cursors.CursorPath, direction: number, expectedSelectedCells: string[]) => {
    editor.setContent(content);
    selectWithKeyboard(editor, selection, direction);
    assertSelectedCells(editor, expectedSelectedCells);
  };

  const assertTableSelection = (editor: Editor, scenario: Scenario) => {
    assertMouseTableSelection(editor, scenario.content, scenario.selection, scenario.expectedSelectedCells);
    assertKeyboardTableSelection(editor, scenario.content, scenario.selection, scenario.keyDirection, scenario.expectedSelectedCells);
  };

  it('TINY-6298: Partially selecting cell content in the nested table', () => {
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
      '</tbody>' +
      '</table>'
    );

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content,
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
      '</tbody>' +
      '</table>'
    );

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content,
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
      '</tbody>' +
      '</table>'
    );

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content,
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
      '</tbody>' +
      '</table>'
    );

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content,
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
      '</tbody>' +
      '</table>'
    );

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content,
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
      '</tbody>' +
      '</table>'
    );

    const firstTableCell = [ 0, 0, 0, 0 ];
    assertTableSelection(
      editor,
      {
        content,
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
    const content = (
      '<p>outside paragraph</p>' +
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
