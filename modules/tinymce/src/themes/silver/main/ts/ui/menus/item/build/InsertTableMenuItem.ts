/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, CustomEvent, Focusing, GuiFactory, ItemTypes, ItemWidget,
  Keying, Memento, NativeEvents, NativeSimulatedEvent, PremadeSpec, Replacing, SystemEvents, Toggling
} from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { Arr, Id } from '@ephox/katamari';

const cellOverEvent = Id.generate('cell-over');
const cellExecuteEvent = Id.generate('cell-execute');

interface CellEvent extends CustomEvent {
  readonly col: number;
  readonly row: number;
}

const makeCell = (row: number, col: number, labelId: string): AlloyComponent => {
  const emitCellOver = (c: AlloyComponent) => AlloyTriggers.emitWith(c, cellOverEvent, { row, col } );
  const emitExecute = (c: AlloyComponent) => AlloyTriggers.emitWith(c, cellExecuteEvent, { row, col } );

  const onClick = (c: AlloyComponent, se: NativeSimulatedEvent) => {
    se.stop();
    emitExecute(c);
  };

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
        AlloyEvents.run(NativeEvents.click(), onClick),
        AlloyEvents.run(SystemEvents.tap(), onClick)
      ]),
      Toggling.config({
        toggleClass: 'tox-insert-table-picker__selected',
        toggleOnExecute: false
      }),
      Focusing.config({ onFocus: emitCellOver })
    ])
  });
};

const makeCells = (labelId: string, numRows: number, numCols: number): AlloyComponent[][] => {
  const cells: AlloyComponent[][] = [];
  for (let i = 0; i < numRows; i++) {
    const row = [];
    for (let j = 0; j < numCols; j++) {
      row.push(makeCell(i, j, labelId));
    }
    cells.push(row);
  }
  return cells;
};

const selectCells = (cells: AlloyComponent[][], selectedRow: number, selectedColumn: number, numRows: number, numColumns: number) => {
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numColumns; j++) {
      Toggling.set(cells[i][j], i <= selectedRow && j <= selectedColumn);
    }
  }
};

const makeComponents = (cells: AlloyComponent[][]): AlloySpec[] =>
  Arr.bind(cells, (cellRow) => Arr.map(cellRow, GuiFactory.premade));

const makeLabelText = (row: number, col: number): PremadeSpec =>
  GuiFactory.text(`${col}x${row}`);

export const renderInsertTableMenuItem = (spec: Menu.InsertTableMenuItem): ItemTypes.WidgetItemSpec => {
  const numRows = 10;
  const numColumns = 10;
  const sizeLabelId = Id.generate('size-label');
  const cells = makeCells(sizeLabelId, numRows, numColumns);
  const emptyLabelText = makeLabelText(0, 0);

  const memLabel = Memento.record({
    dom: {
      tag: 'span',
      classes: [ 'tox-insert-table-picker__label' ],
      attributes: {
        id: sizeLabelId
      }
    },
    components: [ emptyLabelText ],
    behaviours: Behaviour.derive([
      Replacing.config({})
    ])
  });

  return {
    type: 'widget',
    data: { value: Id.generate('widget-id') },
    dom: {
      tag: 'div',
      classes: [ 'tox-fancymenuitem' ]
    },
    autofocus: true,
    components: [ ItemWidget.parts.widget({
      dom: {
        tag: 'div',
        classes: [ 'tox-insert-table-picker' ]
      },
      components: makeComponents(cells).concat(memLabel.asSpec()),
      behaviours: Behaviour.derive([
        AddEventsBehaviour.config('insert-table-picker', [
          AlloyEvents.runOnAttached((c) => {
            // Restore the empty label when opened, otherwise it may still be using an old label from last time it was opened
            Replacing.set(memLabel.get(c), [ emptyLabelText ]);
          }),
          AlloyEvents.runWithTarget<CellEvent>(cellOverEvent, (c, t, e) => {
            const { row, col } = e.event;
            selectCells(cells, row, col, numRows, numColumns);
            Replacing.set(memLabel.get(c), [ makeLabelText(row + 1, col + 1) ]);
          }),
          AlloyEvents.runWithTarget<CellEvent>(cellExecuteEvent, (c, _, e) => {
            const { row, col } = e.event;
            spec.onAction({ numRows: row + 1, numColumns: col + 1 });
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
    }) ]
  };
};
