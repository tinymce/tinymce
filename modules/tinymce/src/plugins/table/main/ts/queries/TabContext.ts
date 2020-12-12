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

const forward = (editor: Editor, isRoot: (e: SugarElement) => boolean, cell: SugarElement<HTMLTableCellElement>, actions: TableActions) => {
  return go(editor, isRoot, CellNavigation.next(cell), actions);
};

const backward = (editor: Editor, isRoot: (e: SugarElement) => boolean, cell: SugarElement<HTMLTableCellElement>, actions: TableActions) => {
  return go(editor, isRoot, CellNavigation.prev(cell), actions);
};

const getCellFirstCursorPosition = (editor: Editor, cell: SugarElement<Node>): Range => {
  const selection = SimSelection.exact(cell, 0, cell, 0);
  return WindowSelection.toNative(selection);
};

const getNewRowCursorPosition = (editor: Editor, table: SugarElement<HTMLTableElement>): Optional<Range> => {
  const rows = SelectorFilter.descendants<HTMLTableRowElement>(table, 'tr');
  return Arr.last(rows).bind((last) => {
    return SelectorFind.descendant<HTMLTableCellElement>(last, 'td,th').map((first) => {
      return getCellFirstCursorPosition(editor, first);
    });
  });
};

const go = (editor: Editor, isRoot: (e: SugarElement) => boolean, cell: CellLocation, actions: TableActions): Optional<Range> => {
  return cell.fold<Optional<Range>>(Optional.none, Optional.none, (current, next) => {
    return CursorPosition.first(next).map((cell) => {
      return getCellFirstCursorPosition(editor, cell);
    });
  }, (current) => {
    return TableLookup.table(current, isRoot).bind((table) => {
      const targets = TableTargets.noMenu(current);
      editor.undoManager.transact(() => {
        actions.insertRowsAfter(table, targets);
      });
      return getNewRowCursorPosition(editor, table);
    });
  });
};

const rootElements = [ 'table', 'li', 'dl' ];

const handle = (event: KeyboardEvent, editor: Editor, actions: TableActions) => {
  if (event.keyCode === VK.TAB) {
    const body = Util.getBody(editor);
    const isRoot = (element) => {
      const name = SugarNode.name(element);
      return Compare.eq(element, body) || Arr.contains(rootElements, name);
    };

    const rng = editor.selection.getRng();
    if (rng.collapsed) {
      const start = SugarElement.fromDom(rng.startContainer);
      TableLookup.cell(start, isRoot).each((cell) => {
        event.preventDefault();
        const navigation = event.shiftKey ? backward : forward;
        const rng = navigation(editor, isRoot, cell, actions);
        rng.each((range) => {
          editor.selection.setRng(range);
        });
      });
    }
  }
};

export {
  handle
};
