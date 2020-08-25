/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { CellLocation, CellNavigation, TableLookup } from '@ephox/snooker';
import { Compare, CursorPosition, SelectorFilter, SelectorFind, SimSelection, SugarElement, SugarNode, WindowSelection } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';
import { TableActions } from '../actions/TableActions';

import * as Util from '../core/Util';
import * as TableTargets from './TableTargets';

const forward = function (editor: Editor, isRoot: (e: SugarElement) => boolean, cell: SugarElement<HTMLTableCellElement>, actions: TableActions) {
  return go(editor, isRoot, CellNavigation.next(cell), actions);
};

const backward = function (editor: Editor, isRoot: (e: SugarElement) => boolean, cell: SugarElement<HTMLTableCellElement>, actions: TableActions) {
  return go(editor, isRoot, CellNavigation.prev(cell), actions);
};

const getCellFirstCursorPosition = function (editor: Editor, cell: SugarElement<Node>): Range {
  const selection = SimSelection.exact(cell, 0, cell, 0);
  return WindowSelection.toNative(selection);
};

const getNewRowCursorPosition = function (editor: Editor, table: SugarElement<HTMLTableElement>): Optional<Range> {
  const rows = SelectorFilter.descendants<HTMLTableRowElement>(table, 'tr');
  return Arr.last(rows).bind(function (last) {
    return SelectorFind.descendant<HTMLTableCellElement>(last, 'td,th').map(function (first) {
      return getCellFirstCursorPosition(editor, first);
    });
  });
};

const go = function (editor: Editor, isRoot: (e: SugarElement) => boolean, cell: CellLocation, actions: TableActions): Optional<Range> {
  return cell.fold<Optional<Range>>(Optional.none, Optional.none, function (current, next) {
    return CursorPosition.first(next).map(function (cell) {
      return getCellFirstCursorPosition(editor, cell);
    });
  }, function (current) {
    return TableLookup.table(current, isRoot).bind(function (table) {
      const targets = TableTargets.noMenu(current);
      editor.undoManager.transact(function () {
        actions.insertRowsAfter(table, targets);
      });
      return getNewRowCursorPosition(editor, table);
    });
  });
};

const rootElements = [ 'table', 'li', 'dl' ];

const handle = function (event: KeyboardEvent, editor: Editor, actions: TableActions) {
  if (event.keyCode === VK.TAB) {
    const body = Util.getBody(editor);
    const isRoot = function (element) {
      const name = SugarNode.name(element);
      return Compare.eq(element, body) || Arr.contains(rootElements, name);
    };

    const rng = editor.selection.getRng();
    if (rng.collapsed) {
      const start = SugarElement.fromDom(rng.startContainer);
      TableLookup.cell(start, isRoot).each(function (cell) {
        event.preventDefault();
        const navigation = event.shiftKey ? backward : forward;
        const rng = navigation(editor, isRoot, cell, actions);
        rng.each(function (range) {
          editor.selection.setRng(range);
        });
      });
    }
  }
};

export {
  handle
};
