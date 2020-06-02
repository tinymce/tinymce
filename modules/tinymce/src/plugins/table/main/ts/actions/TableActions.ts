/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Option } from '@ephox/katamari';
import {
  CellMutations, TableDirection, TableFill, TableGridSize, TableOperations
} from '@ephox/snooker';
import { Element, Node } from '@ephox/sugar';

import * as Util from '../alien/Util';
import * as Direction from '../queries/Direction';
import { getCloneElements } from '../api/Settings';
import { fireNewCell, fireNewRow } from '../api/Events';
import Editor from 'tinymce/core/api/Editor';
import { DomDescent } from '@ephox/phoenix';

export interface TableActions {
  deleteRow: (table: Element<any>, target: any) => any;
  deleteColumn: (table: Element<any>, target: any) => any;
  insertRowsBefore: (table: Element<any>, target: any) => any;
  insertRowsAfter: (table: Element<any>, target: any) => any;
  insertColumnsBefore: (table: Element<any>, target: any) => any;
  insertColumnsAfter: (table: Element<any>, target: any) => any;
  mergeCells: (table: Element<any>, target: any) => any;
  unmergeCells: (table: Element<any>, target: any) => any;
  pasteRowsBefore: (table: Element<any>, target: any) => any;
  pasteRowsAfter: (table: Element<any>, target: any) => any;
  pasteCells: (table: Element<any>, target: any) => any;
  makeRowHeaders: (table: Element<any>, target: any) => any;
  makeColHeaders: (table: Element<any>, target: any) => any;
  makeThead: (table: Element<any>, target: any) => any;
  makeTfoot: (table: Element<any>, target: any) => any;
}

export const TableActions = function (editor: Editor, lazyWire) {
  const isTableBody = function (editor: Editor) {
    return Node.name(Util.getBody(editor)) === 'table';
  };

  const lastRowGuard = function (table) {
    const size = TableGridSize.getGridSize(table);
    return isTableBody(editor) === false || size.rows() > 1;
  };

  const lastColumnGuard = function (table) {
    const size = TableGridSize.getGridSize(table);
    return isTableBody(editor) === false || size.columns() > 1;
  };

  // Option.none gives the default cloneFormats.
  const cloneFormats = getCloneElements(editor);

  const execute = function (operation, guard, mutate, lazyWire) {
    return function (table, target) {
      Util.removeDataStyle(table);
      const wire = lazyWire();
      const doc = Element.fromDom(editor.getDoc());
      const direction = TableDirection(Direction.directionAt);
      const generators = TableFill.cellOperations(mutate, doc, cloneFormats);
      return guard(table) ? operation(wire, table, target, generators, direction).bind(function (result) {
        Arr.each(result.newRows(), function (row) {
          fireNewRow(editor, row.dom());
        });
        Arr.each(result.newCells(), function (cell) {
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
  };

  const deleteRow = execute(TableOperations.eraseRows, lastRowGuard, Fun.noop, lazyWire);

  const deleteColumn = execute(TableOperations.eraseColumns, lastColumnGuard, Fun.noop, lazyWire);

  const insertRowsBefore = execute(TableOperations.insertRowsBefore, Fun.always, Fun.noop, lazyWire);

  const insertRowsAfter = execute(TableOperations.insertRowsAfter, Fun.always, Fun.noop, lazyWire);

  const insertColumnsBefore = execute(TableOperations.insertColumnsBefore, Fun.always, CellMutations.halve, lazyWire);

  const insertColumnsAfter = execute(TableOperations.insertColumnsAfter, Fun.always, CellMutations.halve, lazyWire);

  const mergeCells = execute(TableOperations.mergeCells, Fun.always, Fun.noop, lazyWire);

  const unmergeCells = execute(TableOperations.unmergeCells, Fun.always, Fun.noop, lazyWire);

  const pasteRowsBefore = execute(TableOperations.pasteRowsBefore, Fun.always, Fun.noop, lazyWire);

  const pasteRowsAfter = execute(TableOperations.pasteRowsAfter, Fun.always, Fun.noop, lazyWire);

  const pasteCells = execute(TableOperations.pasteCells, Fun.always, Fun.noop, lazyWire);

  const makeRowHeaders = execute(TableOperations.makeRowHeaders, Fun.always, Fun.noop, lazyWire);

  const makeColHeaders = execute(TableOperations.makeColumnHeaders, Fun.always, Fun.noop, lazyWire);

  const makeThead = execute(TableOperations.makeThead, Fun.always, Fun.noop, lazyWire);
  const makeTfoot = execute(TableOperations.makeTfoot, Fun.always, Fun.noop, lazyWire);

  return {
    deleteRow,
    deleteColumn,
    insertRowsBefore,
    insertRowsAfter,
    insertColumnsBefore,
    insertColumnsAfter,
    mergeCells,
    unmergeCells,
    pasteRowsBefore,
    pasteRowsAfter,
    pasteCells,
    makeRowHeaders,
    makeColHeaders,
    makeThead,
    makeTfoot
  };
};
