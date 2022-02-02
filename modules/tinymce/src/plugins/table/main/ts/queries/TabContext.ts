/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Optional } from '@ephox/katamari';
import { CellLocation, CellNavigation, TableLookup } from '@ephox/snooker';
import { Compare, ContentEditable, CursorPosition, SimSelection, SugarElement, SugarNode, WindowSelection } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import VK from 'tinymce/core/api/util/VK';

import * as Util from '../core/Util';
import { CellSelectionApi } from '../selection/CellSelection';

const forward = (editor: Editor, isRoot: (e: SugarElement<Node>) => boolean, cell: SugarElement<HTMLTableCellElement>) =>
  go(editor, isRoot, CellNavigation.next(cell, ContentEditable.isEditable));

const backward = (editor: Editor, isRoot: (e: SugarElement<Node>) => boolean, cell: SugarElement<HTMLTableCellElement>) =>
  go(editor, isRoot, CellNavigation.prev(cell, ContentEditable.isEditable));

const getCellFirstCursorPosition = (editor: Editor, cell: SugarElement<Node>): Range => {
  const selection = SimSelection.exact(cell, 0, cell, 0);
  return WindowSelection.toNative(selection);
};

const go = (editor: Editor, isRoot: (e: SugarElement<Node>) => boolean, cell: CellLocation): Optional<Range> => {
  return cell.fold<Optional<Range>>(Optional.none, Optional.none, (current, next) => {
    return CursorPosition.first(next).map((cell) => {
      return getCellFirstCursorPosition(editor, cell);
    });
  }, (current) => {
    editor.execCommand('mceTableInsertRowAfter');
    // Move forward from the last cell so that we move into the first valid position in the new row
    return forward(editor, isRoot, current);
  });
};

const rootElements = [ 'table', 'li', 'dl' ];

const handle = (event: KeyboardEvent, editor: Editor, cellSelection: CellSelectionApi): void => {
  if (event.keyCode === VK.TAB) {
    const body = Util.getBody(editor);
    const isRoot = (element: SugarElement<Node>) => {
      const name = SugarNode.name(element);
      return Compare.eq(element, body) || Arr.contains(rootElements, name);
    };

    const rng = editor.selection.getRng();
    // If navigating backwards, use the start of the ranged selection
    const container = SugarElement.fromDom(event.shiftKey ? rng.startContainer : rng.endContainer);
    TableLookup.cell(container, isRoot).each((cell) => {
      event.preventDefault();
      // Clear fake ranged selection because our new selection will always be collapsed
      TableLookup.table(cell, isRoot).each(cellSelection.clear);
      // Collapse selection to start or end based on shift key
      editor.selection.collapse(event.shiftKey);
      const navigation = event.shiftKey ? backward : forward;
      const rng = navigation(editor, isRoot, cell);
      rng.each((range) => {
        editor.selection.setRng(range);
      });
    });
  }
};

export {
  handle
};
