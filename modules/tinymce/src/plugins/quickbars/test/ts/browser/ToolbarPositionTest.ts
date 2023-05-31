import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { Html, SelectorFilter, SelectorFind, SimSelection, SugarBody, SugarElement, WindowSelection } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/quickbars/Plugin';
import TablePlugin from 'tinymce/plugins/table/Plugin';

import { pAssertToolbarVisible } from '../module/test/Utils';

type TableSizingMode = 'relative' | 'fixed';

describe('browser.tinymce.plugins.quickbars.ToolbarPositionTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'quickbars link',
    base_url: '/project/tinymce/js/tinymce',
    min_height: 500,
  }, [ Plugin, TablePlugin ]);

  const pAssertToolbarNotVisible = async () => {
    // We can't wait for something to happen, as nothing will change. So instead, just wait some time for when the toolbar would have normally shown
    await Waiter.pWait(50);
    UiFinder.notExists(SugarBody.body(), '.tox-pop__dialog .tox-toolbar');
  };

  const selectWithMouse = (start: SugarElement<Node>, end: SugarElement<Node>): void => {
    Mouse.mouseDown(start, { button: 0 });
    Mouse.mouseOver(end, { button: 0 });
    Mouse.mouseUp(end, { button: 0 });
  };

  const getCells = (table: SugarElement<HTMLTableElement>, selector: string = 'td,th'): SugarElement<HTMLTableCellElement>[] =>
    SelectorFilter.descendants(table, selector);

  const selectCellsWithMouse = (editor: Editor, selectCells: [ string, string ]) => {
    const table = SelectorFind.descendant<HTMLTableElement>(TinyDom.body(editor), 'table').getOrDie('Could not find table');
    const cells = getCells(table);
    const startTd = Arr.find(cells, (elm) => Html.get(elm) === selectCells[0]).getOrDie('Could not find start TD');
    const endTd = Arr.find(cells, (elm) => Html.get(elm) === selectCells[1]).getOrDie('Could not find end TD');

    selectWithMouse(startTd, endTd);
  };

  const getUnit = (mode: TableSizingMode): 'px' | '%' | null => {
    switch (mode) {
      case 'fixed':
        return 'px';
      case 'relative':
        return '%';
    }
  };

  const generateWidth = (mode: TableSizingMode, cols: number) => `width: ${100 / cols}${getUnit(mode)}`;

  const generateTable = (mode: TableSizingMode, rows: number, cols: number) => {
    const tableWidth = generateWidth(mode, 1);
    const cellWidth = generateWidth(mode, cols);

    const getCellStyle = ` style="${cellWidth}"`;

    const renderedRows = Arr.range(rows, (row) =>
      '<tr>' + Arr.range(cols, (col) => {
        const cellNum = (row * cols) + col + 1;
        return `<td${getCellStyle}>${cellNum}</td>`;
      }).join('') + '</tr>'
    ).join('');

    const renderedColumns = Arr.range(cols, () =>
      `<col style="${cellWidth}"></col>`
    ).join('');

    const colgroups = '<colgroup>' + renderedColumns + '</colgroup>';

    return `<table border="1" style="border-collapse: collapse;${tableWidth}">${colgroups}<tbody>${renderedRows}</tbody></table>`;
  };

  const getBoundsOfSelectedCells = (selectedCells: HTMLTableCellElement[]): Boxes.Bounds => {
    // Using Boxes.absolute instead of getBoundingClient here, because getBoundingClient would return the values relative to the iframe
    // But getBoundingClient on the toolbar would return the values relative to the page, as the sink is placed in the body
    const menuRects = selectedCells.map((x) => Boxes.absolute(SugarElement.fromDom(x)));

    const selectedCellBounds = Arr.foldl(menuRects, (acc, rect) => {
      return {
        x: Math.min(acc.x, rect.x),
        right: Math.max(acc.right, rect.right),
        y: Math.min(acc.y, rect.y),
        bottom: Math.max(acc.bottom, rect.bottom)
      };
    }, {
      x: Number.MAX_VALUE,
      right: Number.MIN_VALUE,
      y: Number.MAX_VALUE,
      bottom: Number.MIN_VALUE
    });

    return {
      width: selectedCellBounds.right - selectedCellBounds.x,
      height: selectedCellBounds.bottom - selectedCellBounds.y,
      ...selectedCellBounds
    };
  };

  const marginOfError = 5;
  const distanceBetweenToolbar = 13;

  const pAssertToolbarPosition = async (selectedCellBounds: Boxes.Bounds) => {
    const toolbarBounds = await getToolbarBounds();
    await pAssertToolbarVisible();

    // The exact bounds of the center of the selection
    const middleOfSelectedCellBounds = (selectedCellBounds.width / 2) + selectedCellBounds.x;

    // Getting half of the toolbar width, as we want to calculate the bounds of the center of the selection +- half of the toolbar width
    const halfOfToolbarWidth = toolbarBounds.width / 2;

    const getHorizontalCenteredBounds = () => {
      return {
        left: middleOfSelectedCellBounds - halfOfToolbarWidth,
        right: middleOfSelectedCellBounds + halfOfToolbarWidth
      };
    };

    const getHorizontalLeftBounds = () => {
      return {
        left: selectedCellBounds.x,
        right: selectedCellBounds.x + toolbarBounds.width,
      };
    };

    const getHorizontalRightBounds = () => {
      return {
        left: selectedCellBounds.right - toolbarBounds.width,
        right: selectedCellBounds.right
      };
    };

    const dialogPadding = 4;
    // Checks if the toolbar is shown at the top or bottom of the selection
    const getToolbarTopBounds = () => {

      return {
        top: selectedCellBounds.y - toolbarBounds.height - distanceBetweenToolbar + dialogPadding,
        bottom: selectedCellBounds.y - distanceBetweenToolbar + dialogPadding
      };
    };

    // Not required to add the dialogPadding, as the top position can be calculated from bottom of the selection + distance between toolbar
    // Bottom position would be the same as the top position + toolbar height
    const getBottomToolbarBounds = () => {
      return {
        top: selectedCellBounds.bottom + distanceBetweenToolbar,
        bottom: selectedCellBounds.bottom + distanceBetweenToolbar + toolbarBounds.height
      };
    };

    const getExpectedBounds = () => {
      // Checking the position of the toolbar, if the toolbar is shown at the top or bottom of the selection
      const toolbarLocation = toolbarBounds.top < selectedCellBounds.y ? 'top' : 'bottom';

      const getHorizontalBounds = () => {
        // When there's sufficient space to show the toolbar in the middle of the selection, it should be in the middle of the selection horizontally
        // When there's insufficient space to show the toolbar in the middle of the selection, it should be from the left, or the right of the selection

        // The exact bounds of the center of the toolbar, to determine if the toolbar is shown in the middle of the selection, or from the left of the selection or the right
        const middleOfToolbarBounds = halfOfToolbarWidth + toolbarBounds.x;

        if (Math.abs(middleOfToolbarBounds - middleOfSelectedCellBounds) < 5) {
          return getHorizontalCenteredBounds();
        } else if (middleOfToolbarBounds > middleOfSelectedCellBounds) {
          return getHorizontalLeftBounds();
        }

        return getHorizontalRightBounds();
      };

      return {
        ...(toolbarLocation === 'top' ? getToolbarTopBounds() : getBottomToolbarBounds()),
        ...(getHorizontalBounds())
      };
    };

    const expectedBounds = getExpectedBounds();

    assert.closeTo(toolbarBounds.left, expectedBounds.left, marginOfError, 'Toolbar left is not positioned correctly');
    assert.closeTo(toolbarBounds.top, expectedBounds.top, marginOfError, 'Toolbar top is not positioned correctly');
    assert.closeTo(toolbarBounds.bottom, expectedBounds.bottom, marginOfError, 'Toolbar bottom is not positioned correctly');
    assert.closeTo(toolbarBounds.right, expectedBounds.right, marginOfError, 'Toolbar right is not positioned correctly');
  };

  const getToolbarBounds = async (): Promise<DOMRect> => {
    const toolbar = await UiFinder.pWaitFor('Wait for toolbar to exist', SugarBody.body(), '.tox-pop__dialog .tox-toolbar');
    return toolbar.dom.getBoundingClientRect();
  };

  const pRemoveToolbar = async (editor: Editor) => {
    TinySelections.setCursor(editor, [ 1 ], 0);
    await pAssertToolbarNotVisible();
  };

  // Test with different tableLayout, as the toolbar is positioned differently, when it has sufficient space to show the toolbar in the middle of the selection
  Arr.each([ 'fixed', 'relative' ], (tableLayout: TableSizingMode) => {
    context(`Table layout: ${tableLayout}`, () => {

      // Traverse row to row, selects 2 cells initially, then it expands the selection to the right and once it has reaches the end, moves the starting position to the next column
      // Once convered all cells in the row, it moves to the next row
      // E.g.: selected cells for 3x3 table
      // 1. 1, 2
      // 2. 1, 2, 3
      // 3. once it has reached the of the row, it moves the starting position to start with 2,3
      // 4. 2, 3
      // and moves to the next row....
      it(`TINY-8297: Toolbar display in the center of horizontal selection`, async () => {
        const editor = hook.editor();
        const columnSize = 3;
        const rowSize = 3;

        editor.focus();
        editor.setContent(generateTable(tableLayout, rowSize, columnSize));

        for (let row = 1; row <= rowSize; row++ ) {
          const currentRowMax = (row * columnSize) + 1;
          let windowStart = ((row - 1) * columnSize) + 1;

          for (let windowEnd = windowStart + 1; windowEnd < currentRowMax; windowEnd++) {
            let currentWindowEnd = windowEnd;

            while (currentWindowEnd < currentRowMax) {
              selectCellsWithMouse(editor, [ windowStart.toString(), currentWindowEnd.toString() ]);

              const selectedCells = editor.model.table.getSelectedCells();
              const selectedCellBounds = getBoundsOfSelectedCells(selectedCells);

              await pAssertToolbarPosition(selectedCellBounds);
              await pRemoveToolbar(editor);

              currentWindowEnd++;
            }

            windowStart++;
          }
        }
      });

      // Traverse column to column, selects 2 cells vertically initially, then it expands the selection to the bottom and once it has reaches the bottom, moves the starting position to the next row
      // Once convered all cells in the column, it moves to the next column
      // E.g.: selected cells for 3x3 table
      // 1. 1, 4
      // 2. 1, 4, 7
      // 3. once it has reached the of the column, it moves the starting position to start with 4, 7
      // 4. 4, 7
      // and moves to the next column....
      it(`TINY-8297: Toolbar display in the center of vertical selection`, async () => {
        const editor = hook.editor();
        const columnSize = 3;
        const rowSize = 3;

        editor.focus();
        editor.setContent(generateTable(tableLayout, rowSize, columnSize));

        for (let column = 1; column <= columnSize; column++) {
          const currentColumnMax = (rowSize - 1) * columnSize + column;
          let windowStart = column;

          for (let windowEnd = windowStart + columnSize; windowEnd <= currentColumnMax; windowEnd += columnSize) {
            let currentWindowEnd = windowEnd;

            while (currentWindowEnd <= currentColumnMax) {
              selectCellsWithMouse(editor, [ windowStart.toString(), currentWindowEnd.toString() ]);

              const selectedCells = editor.model.table.getSelectedCells();
              const selectedCellBounds = getBoundsOfSelectedCells(selectedCells);

              await pAssertToolbarPosition(selectedCellBounds);
              await pRemoveToolbar(editor);

              currentWindowEnd += columnSize;
            }

            windowStart += columnSize;
          }
        }
      });

      // Traverse 2x2, then it expands the selection to 3x3, 4x4...
      // Once convered all cells with the starting position, it moves the starting position
      // E.g.: selected cells for 6x6 table
      // 1. 1, 2, 7, 8
      // 2. 1, 2, 3, 7, 8, 9, 13, 14, 15
      // 3. once it has reached the end, it moves the starting position to start with 7, 8
      // 4. 7, 8, 13, 14
      // and ....
      it(`TINY-8297: Toolbar display in the center of box selection`, async () => {
        const editor = hook.editor();
        const columnSize = 6;
        const rowSize = 6;
        const tableSize = columnSize * rowSize;

        editor.setContent(generateTable(tableLayout, rowSize, columnSize));
        editor.focus();

        const columnsToMove = columnSize + 1;
        let windowStart = 1;

        for (let windowEnd = windowStart + columnsToMove; windowEnd <= tableSize; windowEnd += columnsToMove) {
          let currentWindowEnd = windowEnd;

          while (currentWindowEnd <= tableSize) {
            selectCellsWithMouse(editor, [ windowStart.toString(), currentWindowEnd.toString() ]);

            const selectedCells = editor.model.table.getSelectedCells();
            const selectedCellBounds = getBoundsOfSelectedCells(selectedCells);

            await pAssertToolbarPosition(selectedCellBounds);
            await pRemoveToolbar(editor);

            currentWindowEnd += columnsToMove;
          }

          windowStart += columnsToMove;
        }
      });
    });

    context('Selection outside table', () => {
      // Skipping safari, the quickbar toolbar is positioned differently in safari and chrome, see TINY-9851
      const skipIfSafari = PlatformDetection.detect().browser.isSafari() ? it.skip : it;

      // When selection starts from outside the table and expands to the table, the toolbar should be displayed in the center of the table
      skipIfSafari('TINY-8297: Selection starts from starting paragraph and expands to the first cell of the table in the editor', async () => {
        const editor = hook.editor();
        editor.setContent('<p>Some text</p>' + generateTable(tableLayout, 3, 3));
        editor.focus();

        TinySelections.setSelection(editor, [ 0, 0 ], 0, [ 1, 1, 0, 0 ], 1);

        const table = SelectorFind.descendant<HTMLTableElement>(TinyDom.body(editor), 'table').getOrDie('Could not find table');
        const tableBounds = Boxes.absolute(table);
        await pAssertToolbarPosition(tableBounds);

        await pRemoveToolbar(editor);
      });

      // When selection starts from last cell of the table and expands to the last paragraph in the editor, the toolbar should be displayed in the center of the table
      it('TINY-8297: Selection starts from last cell of table and expands to the last paragraph in the editor', async () => {
        const editor = hook.editor();
        editor.setContent(generateTable(tableLayout, 3, 3) + '<p>Some Text</p>' );
        editor.focus();

        TinySelections.setSelection(editor, [ 0, 1, 2, 2 ], 0, [ 1, 0 ], 9);

        const table = SelectorFind.descendant<HTMLTableElement>(TinyDom.body(editor), 'table').getOrDie('Could not find table');
        const cells = getCells(table);
        const td = Arr.find(cells, (elm) => Html.get(elm) === '9').getOrDie('Could not find TD');
        const tableBounds = WindowSelection.getBounds(window, SimSelection.exact(td, 0, td, 1)).getOrDie('Could not get bounds of table cell');

        const paragraph = SelectorFind.descendant<HTMLParagraphElement>(TinyDom.body(editor), 'p').getOrDie('Could not find paragraph');
        const selP = SimSelection.exact(paragraph, 0, paragraph, 1);
        const paragraphBounds = WindowSelection.getBounds(window, selP).getOrDie('Could not get bounds of paragraph');

        // Adding getContentAreaContainer().getBoundingClientRect().top as WindowSelection.getBounds() returns the position relative to the iframe
        const mergedBounds = {
          x: paragraphBounds.left,
          right: Math.max(tableBounds.right, paragraphBounds.right),
          bottom: paragraphBounds.bottom,
          y: tableBounds.top + editor.getContentAreaContainer().getBoundingClientRect().top
        };

        await pAssertToolbarPosition({
          ...mergedBounds,
          width: mergedBounds.right - mergedBounds.x,
          height: mergedBounds.bottom - mergedBounds.y,
        });

        await pRemoveToolbar(editor);
      });
    });
  });
});
