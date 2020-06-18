/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option } from '@ephox/katamari';
import {
  CellMutations, TableDirection, TableFill, TableGridSize, TableOperations, RunOperation, ResizeWire
} from '@ephox/snooker';
import { Element, Node } from '@ephox/sugar';

import * as Util from '../alien/Util';
import * as Direction from '../queries/Direction';
import { getCloneElements } from '../api/Settings';
import { fireNewCell, fireNewRow } from '../api/Events';
import Editor from 'tinymce/core/api/Editor';
import { DomDescent } from '@ephox/phoenix';
import { HTMLTableElement, Range } from '@ephox/dom-globals';

type TableAction<T> = (table: Element<HTMLTableElement>, target: T) => Option<Range>;
export type BasicTableAction = TableAction<RunOperation.CombinedTargets>;
export type PasteTableAction = TableAction<RunOperation.TargetPaste>;
export type AdvancedPasteTableAction = TableAction<RunOperation.TargetPasteRows>;

export interface TableActions {
  deleteRow: BasicTableAction;
  deleteColumn: BasicTableAction;
  insertRowsBefore: BasicTableAction;
  insertRowsAfter: BasicTableAction;
  insertColumnsBefore: BasicTableAction;
  insertColumnsAfter: BasicTableAction;
  mergeCells: BasicTableAction;
  unmergeCells: BasicTableAction;
  pasteColsBefore: AdvancedPasteTableAction;
  pasteColsAfter: AdvancedPasteTableAction;
  pasteRowsBefore: AdvancedPasteTableAction;
  pasteRowsAfter: AdvancedPasteTableAction;
  pasteCells: PasteTableAction;
}

export const TableActions = (editor: Editor, lazyWire: () => ResizeWire): TableActions => {
  const isTableBody = (editor: Editor) => Node.name(Util.getBody(editor)) === 'table';

  const lastRowGuard = (table: Element<HTMLTableElement>) => isTableBody(editor) === false || TableGridSize.getGridSize(table).rows() > 1;

  const lastColumnGuard = (table: Element<HTMLTableElement>) =>
    isTableBody(editor) === false || TableGridSize.getGridSize(table).columns() > 1;

  // Option.none gives the default cloneFormats.
  const cloneFormats = getCloneElements(editor);

  const execute = <T> (operation: RunOperation.OperationCallback<T>, guard, mutate, lazyWire) =>
    (table: Element<HTMLTableElement>, target: T): Option<Range> => {
      Util.removeDataStyle(table);
      const wire = lazyWire();
      const doc = Element.fromDom(editor.getDoc());
      const direction = TableDirection(Direction.directionAt);
      const generators = TableFill.cellOperations(mutate, doc, cloneFormats);
      return guard(table) ? operation(wire, table, target, generators, direction).bind((result) => {
        Arr.each(result.newRows(), (row) => {
          fireNewRow(editor, row.dom());
        });
        Arr.each(result.newCells(), (cell) => {
          fireNewCell(editor, cell.dom());
        });
        return result.cursor().map((cell) => {
          const des = DomDescent.freefallRtl(cell);
          const rng = editor.dom.createRng();
          rng.setStart(des.element().dom(), des.offset());
          rng.setEnd(des.element().dom(), des.offset());
          return rng;
        });
      }) : Option.none();
    };

  const deleteRow = execute(TableOperations.eraseRows, lastRowGuard, Fun.noop, lazyWire);

  const deleteColumn = execute(TableOperations.eraseColumns, lastColumnGuard, Fun.noop, lazyWire);

  const insertRowsBefore = execute(TableOperations.insertRowsBefore, Fun.always, Fun.noop, lazyWire);

  const insertRowsAfter = execute(TableOperations.insertRowsAfter, Fun.always, Fun.noop, lazyWire);

  const insertColumnsBefore = execute(TableOperations.insertColumnsBefore, Fun.always, CellMutations.halve, lazyWire);

  const insertColumnsAfter = execute(TableOperations.insertColumnsAfter, Fun.always, CellMutations.halve, lazyWire);

  const mergeCells = execute(TableOperations.mergeCells, Fun.always, Fun.noop, lazyWire);

  const unmergeCells = execute(TableOperations.unmergeCells, Fun.always, Fun.noop, lazyWire);

  const pasteColsBefore = execute(TableOperations.pasteColsBefore, Fun.always, Fun.noop, lazyWire);

  const pasteColsAfter = execute(TableOperations.pasteColsAfter, Fun.always, Fun.noop, lazyWire);

  const pasteRowsBefore = execute(TableOperations.pasteRowsBefore, Fun.always, Fun.noop, lazyWire);

  const pasteRowsAfter = execute(TableOperations.pasteRowsAfter, Fun.always, Fun.noop, lazyWire);

  const pasteCells = execute(TableOperations.pasteCells, Fun.always, Fun.noop, lazyWire);

  return {
    deleteRow,
    deleteColumn,
    insertRowsBefore,
    insertRowsAfter,
    insertColumnsBefore,
    insertColumnsAfter,
    mergeCells,
    unmergeCells,
    pasteColsBefore,
    pasteColsAfter,
    pasteRowsBefore,
    pasteRowsAfter,
    pasteCells
  };
};
