/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, CustomEvent, Focusing, GuiFactory, ItemTypes, ItemWidget, Keying, Memento, NativeEvents, Replacing, SystemEvents, Toggling } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Arr, Id } from '@ephox/katamari';

const cellOverEvent = Id.generate('cell-over');
const cellExecuteEvent = Id.generate('cell-execute');

interface CellEvent extends CustomEvent {
  col: () => Number;
  row: () => Number;
}

const makeCell = (row, col, labelId) => {
  const emitCellOver = (c) => AlloyTriggers.emitWith(c, cellOverEvent, {row, col} );
  const emitExecute = (c) => AlloyTriggers.emitWith(c, cellExecuteEvent, {row, col} );

  return GuiFactory.build({
    dom: {
      tag: 'div',
      attributes: {
        role: 'button',
        ['aria-labelledby']: labelId
      }
    },
    behaviours: Behaviour.derive([
      AddEventsBehaviour.config('insert-table-picker-cell', [
        AlloyEvents.run(NativeEvents.mouseover(), Focusing.focus),
        AlloyEvents.run(SystemEvents.execute(), emitExecute),
        AlloyEvents.run(SystemEvents.tapOrClick(), (c, se) => {
          se.stop();
          emitExecute(c);
        })
      ]),
      Toggling.config({
        toggleClass: 'tox-insert-table-picker__selected',
        toggleOnExecute: false
      }),
      Focusing.config({onFocus: emitCellOver})
    ])
  });
};

const makeCells =  (labelId, numRows, numCols) => {
  const cells = [];
  for (let i = 0; i < numRows; i++) {
    const row = [];
    for (let j = 0; j < numCols; j++) {
      row.push(makeCell(i, j, labelId));
    }
    cells.push(row);
  }
  return cells;
};

const selectCells = (cells, selectedRow, selectedColumn, numRows, numColumns) => {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numColumns; j++) {
      Toggling.set(cells[i][j], i <= selectedRow && j <= selectedColumn);
    }
  }
};

const makeComponents = (cells: Array<Array<AlloyComponent>>): Array<AlloySpec> =>
  Arr.bind(cells, (cellRow) => Arr.map(cellRow, GuiFactory.premade));

const makeLabelText = (row, col) => GuiFactory.text(`${col + 1}x${row + 1}`);

export function renderInsertTableMenuItem(spec: Menu.FancyMenuItem): ItemTypes.WidgetItemSpec {
  const numRows = 10;
  const numColumns = 10;
  const sizeLabelId = Id.generate('size-label');
  const cells = makeCells(sizeLabelId, numRows, numColumns);

  const memLabel = Memento.record({
    dom: {
      tag: 'span',
      classes: ['tox-insert-table-picker__label'],
      attributes: {
        id: sizeLabelId
      }
    },
    components: [GuiFactory.text('0x0')],
    behaviours: Behaviour.derive([
      Replacing.config({})
    ])
  });

  return {
    type: 'widget',
    data: { value: Id.generate('widget-id')},
    dom: {
      tag: 'div',
      classes: ['tox-fancymenuitem'],
    },
    autofocus: true,
    components: [ItemWidget.parts().widget({
      dom: {
        tag: 'div',
        classes: ['tox-insert-table-picker']
      },
      components: makeComponents(cells).concat(memLabel.asSpec()),
      behaviours: Behaviour.derive([
        AddEventsBehaviour.config('insert-table-picker', [
          AlloyEvents.runWithTarget<CellEvent>(cellOverEvent, (c, t, e) => {
            const row = e.event().row();
            const col = e.event().col();
            selectCells(cells, row, col, numRows, numColumns);
            Replacing.set(memLabel.get(c), [makeLabelText(row, col)]);
          }),
          AlloyEvents.runWithTarget<CellEvent>(cellExecuteEvent, (c, _, e) => {
            spec.onAction({numRows: e.event().row() + 1, numColumns: e.event().col() + 1});
            AlloyTriggers.emit(c, SystemEvents.sandboxClose());
          })
        ]),
        Keying.config({
          initSize: {
            numRows,
            numColumns
          },
          mode: 'flatgrid',
          selector: '[role="button"]'
        })
      ])
    })]
  };
}
